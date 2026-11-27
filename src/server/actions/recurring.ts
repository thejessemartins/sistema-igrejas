"use server";

import { revalidatePath } from "next/cache";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { recurringCommitments, recurringOccurrences } from "@/db/schema";
import { requirePermission } from "@/lib/session";
import { recurringCommitmentSchema } from "@/lib/validations";
import { logAudit } from "@/server/services/audit";
import type { ActionResult } from "./auth";

function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function clampDay(year: number, monthIndex: number, day: number): Date {
  const lastDay = new Date(year, monthIndex + 1, 0).getDate();
  return new Date(year, monthIndex, Math.min(day, lastDay));
}

function generateOccurrenceDates(
  startsAt: string,
  endsAt: string | null | undefined,
  frequency: "mensal" | "semanal",
  dayOfMonth: number | null | undefined,
  fromDate?: Date
): string[] {
  const start = new Date(`${startsAt}T12:00:00`);
  const endLimit = endsAt ? new Date(`${endsAt}T12:00:00`) : null;
  const base = fromDate && fromDate > start ? fromDate : start;
  const horizon = new Date(base);
  horizon.setMonth(horizon.getMonth() + 12);

  const dates: string[] = [];

  if (frequency === "mensal") {
    const targetDay = dayOfMonth ?? start.getDate();
    for (let i = 0; i < 12; i++) {
      const candidate = clampDay(
        base.getFullYear(),
        base.getMonth() + i,
        targetDay
      );
      if (candidate < start) continue;
      if (endLimit && candidate > endLimit) break;
      if (candidate > horizon) break;
      dates.push(toIsoDate(candidate));
    }
  } else {
    const cursor = new Date(base);
    while (cursor < start) {
      cursor.setDate(cursor.getDate() + 7);
    }
    while (cursor <= horizon) {
      if (endLimit && cursor > endLimit) break;
      dates.push(toIsoDate(cursor));
      cursor.setDate(cursor.getDate() + 7);
    }
  }

  return dates;
}

export async function createRecurringCommitment(
  input: unknown
): Promise<ActionResult> {
  const session = await requirePermission("financeiro", "criar");
  const parsed = recurringCommitmentSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  const data = parsed.data;
  const dueDates = generateOccurrenceDates(
    data.startsAt,
    data.endsAt,
    data.frequency,
    data.dayOfMonth
  );

  const created = await db.transaction(async (tx) => {
    const [commitment] = await tx
      .insert(recurringCommitments)
      .values({
        memberId: data.memberId,
        categoryId: data.categoryId,
        amountCents: data.amountCents,
        frequency: data.frequency,
        dayOfMonth: data.dayOfMonth ?? null,
        startsAt: data.startsAt,
        endsAt: data.endsAt || null,
        status: "ativo",
        notes: data.notes || null,
      })
      .returning({ id: recurringCommitments.id });

    if (dueDates.length > 0) {
      await tx
        .insert(recurringOccurrences)
        .values(
          dueDates.map((dueDate) => ({
            commitmentId: commitment.id,
            dueDate,
          }))
        )
        .onConflictDoNothing();
    }

    return commitment;
  });

  await logAudit({
    userId: session.user.id,
    acao: "criacao_compromisso_recorrente",
    entidade: "recurring_commitment",
    entidadeId: created.id,
    detalhes: {
      amountCents: data.amountCents,
      frequency: data.frequency,
      occurrencesGenerated: dueDates.length,
    },
  });

  revalidatePath("/financeiro/recorrentes");
  revalidatePath("/painel");
  return {
    ok: true,
    message: `Compromisso criado com ${dueDates.length} ocorrência(s) gerada(s).`,
  };
}

export async function updateRecurringCommitmentStatus(
  id: string,
  status: "ativo" | "pausado" | "encerrado"
): Promise<ActionResult> {
  const session = await requirePermission("financeiro", "editar");

  const [existing] = await db
    .select({ id: recurringCommitments.id })
    .from(recurringCommitments)
    .where(
      and(
        eq(recurringCommitments.id, id),
        isNull(recurringCommitments.deletedAt)
      )
    )
    .limit(1);

  if (!existing) {
    return { ok: false, error: "Compromisso não encontrado." };
  }

  await db
    .update(recurringCommitments)
    .set({ status, updatedAt: new Date() })
    .where(eq(recurringCommitments.id, id));

  await logAudit({
    userId: session.user.id,
    acao: "alteracao_status_compromisso_recorrente",
    entidade: "recurring_commitment",
    entidadeId: id,
    detalhes: { status },
  });

  revalidatePath("/financeiro/recorrentes");
  revalidatePath("/painel");
  return { ok: true, message: `Status atualizado para ${status}.` };
}

export async function extendRecurringCommitment(
  id: string
): Promise<ActionResult> {
  const session = await requirePermission("financeiro", "editar");

  const [commitment] = await db
    .select()
    .from(recurringCommitments)
    .where(
      and(
        eq(recurringCommitments.id, id),
        isNull(recurringCommitments.deletedAt)
      )
    )
    .limit(1);

  if (!commitment) {
    return { ok: false, error: "Compromisso não encontrado." };
  }

  if (commitment.status !== "ativo") {
    return {
      ok: false,
      error: "Apenas compromissos ativos podem ser prorrogados.",
    };
  }

  const dueDates = generateOccurrenceDates(
    commitment.startsAt,
    commitment.endsAt,
    commitment.frequency as "mensal" | "semanal",
    commitment.dayOfMonth,
    new Date()
  );

  if (dueDates.length > 0) {
    await db.transaction(async (tx) => {
      await tx
        .insert(recurringOccurrences)
        .values(
          dueDates.map((dueDate) => ({
            commitmentId: commitment.id,
            dueDate,
          }))
        )
        .onConflictDoNothing();
    });
  }

  await logAudit({
    userId: session.user.id,
    acao: "prorrogacao_compromisso_recorrente",
    entidade: "recurring_commitment",
    entidadeId: id,
    detalhes: { checkedDates: dueDates.length },
  });

  revalidatePath("/financeiro/recorrentes");
  revalidatePath("/painel");
  return { ok: true, message: "Ocorrências prorrogadas pelos próximos 12 meses." };
}
