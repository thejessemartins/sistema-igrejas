"use server";

import { revalidatePath } from "next/cache";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import {
  surveyAnswers,
  surveyQuestions,
  surveyResponses,
  surveys,
} from "@/db/schema";
import { requireSession } from "@/lib/session";
import { logAudit } from "@/server/services/audit";
import type { ActionResult } from "./auth";

const questionInputSchema = z.object({
  questionText: z.string().trim().min(2, "Pergunta é obrigatória"),
  kind: z.enum([
    "texto_curto",
    "texto_longo",
    "unica_escolha",
    "multipla_escolha",
    "nota_1_5",
    "sim_nao",
  ]),
  options: z.array(z.string().trim().min(1)).optional().nullable(),
  isRequired: z.boolean().default(true),
});

const createSurveySchema = z.object({
  title: z.string().trim().min(2, "Título é obrigatório").max(200),
  description: z.string().trim().max(1000).optional().nullable(),
  audienceType: z
    .enum(["todos", "ministerio", "celula", "papeis"])
    .default("todos"),
  ministryId: z.string().uuid().optional().nullable(),
  cellId: z.string().uuid().optional().nullable(),
  isAnonymous: z.boolean().default(false),
  questions: z.array(questionInputSchema).min(1, "Adicione ao menos 1 pergunta"),
});

function canManageSurveys(role: string | null | undefined): boolean {
  return ["admin", "pastor", "secretario"].includes(role ?? "");
}

export async function createSurvey(input: unknown): Promise<ActionResult> {
  const session = await requireSession();
  if (!canManageSurveys(session.user.role)) {
    return { ok: false, error: "Sem permissão para criar pesquisas." };
  }

  const parsed = createSurveySchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  const created = await db.transaction(async (tx) => {
    const [s] = await tx
      .insert(surveys)
      .values({
        title: parsed.data.title,
        description: parsed.data.description || null,
        audienceType: parsed.data.audienceType,
        ministryId: parsed.data.ministryId || null,
        cellId: parsed.data.cellId || null,
        isAnonymous: parsed.data.isAnonymous,
        status: "rascunho",
        createdBy: session.user.id,
      })
      .returning({ id: surveys.id });

    await tx.insert(surveyQuestions).values(
      parsed.data.questions.map((q, idx) => ({
        surveyId: s.id,
        position: idx + 1,
        questionText: q.questionText,
        kind: q.kind,
        optionsJson: q.options && q.options.length > 0 ? q.options : null,
        isRequired: q.isRequired,
      }))
    );

    return s;
  });

  await logAudit({
    userId: session.user.id,
    acao: "criacao_pesquisa",
    entidade: "survey",
    entidadeId: created.id,
    detalhes: { title: parsed.data.title },
  });

  revalidatePath("/pesquisas");
  return { ok: true, message: "Pesquisa criada em rascunho." };
}

export async function updateSurveyStatus(
  id: string,
  status: "publicada" | "encerrada"
): Promise<ActionResult> {
  const session = await requireSession();
  if (!canManageSurveys(session.user.role)) {
    return { ok: false, error: "Sem permissão." };
  }

  await db
    .update(surveys)
    .set({ status, updatedAt: new Date() })
    .where(and(eq(surveys.id, id), isNull(surveys.deletedAt)));

  revalidatePath("/pesquisas");
  revalidatePath(`/pesquisas/${id}/resultados`);
  return { ok: true, message: `Pesquisa ${status}.` };
}

export async function submitSurveyResponse(
  surveyId: string,
  answersInput: Record<string, string | string[]>
): Promise<ActionResult> {
  const session = await requireSession();

  const [survey] = await db
    .select()
    .from(surveys)
    .where(and(eq(surveys.id, surveyId), isNull(surveys.deletedAt)))
    .limit(1);

  if (!survey || survey.status !== "publicada") {
    return { ok: false, error: "Pesquisa não está aberta para respostas." };
  }

  if (!survey.isAnonymous) {
    const [existing] = await db
      .select({ id: surveyResponses.id })
      .from(surveyResponses)
      .where(
        and(
          eq(surveyResponses.surveyId, surveyId),
          eq(surveyResponses.userId, session.user.id)
        )
      )
      .limit(1);

    if (existing) {
      return { ok: false, error: "Você já respondeu a esta pesquisa." };
    }
  }

  const questions = await db
    .select()
    .from(surveyQuestions)
    .where(eq(surveyQuestions.surveyId, surveyId));

  for (const q of questions) {
    const val = answersInput[q.id];
    const isEmpty =
      val === undefined ||
      val === null ||
      (typeof val === "string" && val.trim() === "") ||
      (Array.isArray(val) && val.length === 0);
    if (q.isRequired && isEmpty) {
      return {
        ok: false,
        error: `A pergunta "${q.questionText}" é obrigatória.`,
      };
    }
  }

  await db.transaction(async (tx) => {
    const [resp] = await tx
      .insert(surveyResponses)
      .values({
        surveyId,
        userId: survey.isAnonymous ? null : session.user.id,
      })
      .returning({ id: surveyResponses.id });

    const rows = questions
      .map((q) => {
        const val = answersInput[q.id];
        if (val === undefined || val === null) return null;
        if (Array.isArray(val)) {
          return {
            responseId: resp.id,
            questionId: q.id,
            valueText: null,
            valuesJson: val,
          };
        }
        return {
          responseId: resp.id,
          questionId: q.id,
          valueText: String(val),
          valuesJson: null,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);

    if (rows.length > 0) {
      await tx.insert(surveyAnswers).values(rows);
    }
  });

  revalidatePath("/pesquisas");
  revalidatePath(`/pesquisas/${surveyId}/resultados`);
  return { ok: true, message: "Resposta registrada com sucesso!" };
}
