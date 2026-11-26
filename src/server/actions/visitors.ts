"use server";

import { revalidatePath } from "next/cache";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { members, visitors, visitorVisits } from "@/db/schema";
import { requirePermission } from "@/lib/session";
import {
  FOLLOW_UP_STATUSES,
  visitorSchema,
  visitorVisitSchema,
  type FollowUpStatus,
} from "@/lib/validations";
import { logAudit } from "@/server/services/audit";
import type { ActionResult } from "./auth";

export async function createVisitor(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const session = await requirePermission("visitantes", "criar");
  const parsed = visitorSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  const firstVisitAt = parsed.data.firstVisitAt
    ? new Date(parsed.data.firstVisitAt)
    : new Date();

  const [created] = await db
    .insert(visitors)
    .values({
      fullName: parsed.data.fullName,
      phone: parsed.data.phone || null,
      email: parsed.data.email || null,
      invitedByMemberId: parsed.data.invitedByMemberId || null,
      invitedByText: parsed.data.invitedByText || null,
      firstVisitAt,
      followUpStatus: "novo",
      notes: parsed.data.notes || null,
    })
    .returning({ id: visitors.id });

  await db.insert(visitorVisits).values({
    visitorId: created.id,
    visitedAt: firstVisitAt,
    notes: parsed.data.notes || "Primeira visita",
  });

  await logAudit({
    userId: session.user.id,
    acao: "criacao_visitante",
    entidade: "visitor",
    entidadeId: created.id,
    detalhes: { nome: parsed.data.fullName },
  });

  revalidatePath("/visitantes");
  return {
    ok: true,
    message: "Visitante cadastrado com sucesso.",
    data: { id: created.id },
  };
}

export async function registerVisitorVisit(
  input: unknown
): Promise<ActionResult> {
  const session = await requirePermission("visitantes", "editar");
  const parsed = visitorVisitSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  await db.insert(visitorVisits).values({
    visitorId: parsed.data.visitorId,
    visitedAt: parsed.data.visitedAt
      ? new Date(parsed.data.visitedAt)
      : new Date(),
    notes: parsed.data.notes || null,
  });

  await logAudit({
    userId: session.user.id,
    acao: "registro_visita_visitante",
    entidade: "visitor",
    entidadeId: parsed.data.visitorId,
  });

  revalidatePath("/visitantes");
  revalidatePath(`/visitantes/${parsed.data.visitorId}`);
  return { ok: true, message: "Nova visita registrada." };
}

export async function changeVisitorStatus(
  visitorId: string,
  status: FollowUpStatus
): Promise<ActionResult> {
  const session = await requirePermission("visitantes", "editar");
  if (!FOLLOW_UP_STATUSES.includes(status)) {
    return { ok: false, error: "Status inválido." };
  }

  const [existing] = await db
    .select({ id: visitors.id, followUpStatus: visitors.followUpStatus })
    .from(visitors)
    .where(and(eq(visitors.id, visitorId), isNull(visitors.deletedAt)))
    .limit(1);

  if (!existing) {
    return { ok: false, error: "Visitante não encontrado." };
  }

  await db
    .update(visitors)
    .set({ followUpStatus: status, updatedAt: new Date() })
    .where(eq(visitors.id, visitorId));

  await logAudit({
    userId: session.user.id,
    acao: "mudanca_status_visitante",
    entidade: "visitor",
    entidadeId: visitorId,
    detalhes: { anterior: existing.followUpStatus, novo: status },
  });

  revalidatePath("/visitantes");
  revalidatePath(`/visitantes/${visitorId}`);
  return { ok: true, message: "Status atualizado com sucesso." };
}

export async function convertVisitorToMember(
  visitorId: string,
  forceCreate = false
): Promise<ActionResult<{ memberId: string; duplicateWarning?: string }>> {
  const session = await requirePermission("membros", "criar");
  await requirePermission("visitantes", "editar");

  const [visitor] = await db
    .select()
    .from(visitors)
    .where(and(eq(visitors.id, visitorId), isNull(visitors.deletedAt)))
    .limit(1);

  if (!visitor) {
    return { ok: false, error: "Visitante não encontrado." };
  }

  if (visitor.convertedMemberId) {
    return {
      ok: false,
      error: "Este visitante já foi convertido em membro.",
    };
  }

  if (!visitor.phone && !visitor.email) {
    return {
      ok: false,
      error:
        "Para converter em membro, o visitante precisa ter telefone ou e-mail.",
    };
  }

  if (!forceCreate && visitor.phone) {
    const [dup] = await db
      .select({ id: members.id, fullName: members.fullName })
      .from(members)
      .where(and(eq(members.phone, visitor.phone), isNull(members.deletedAt)))
      .limit(1);

    if (dup) {
      return {
        ok: false,
        error: `Já existe um membro com este telefone (${dup.fullName}). Confirme para converter mesmo assim.`,
      };
    }
  }

  const [createdMember] = await db
    .insert(members)
    .values({
      fullName: visitor.fullName,
      phone: visitor.phone,
      email: visitor.email,
      notes: visitor.notes,
      status: "ativo",
      joinedAt: new Date().toISOString().slice(0, 10),
    })
    .returning({ id: members.id });

  await db
    .update(visitors)
    .set({
      convertedMemberId: createdMember.id,
      followUpStatus: "virou_membro",
      updatedAt: new Date(),
    })
    .where(eq(visitors.id, visitorId));

  await logAudit({
    userId: session.user.id,
    acao: "conversao_visitante_membro",
    entidade: "visitor",
    entidadeId: visitorId,
    detalhes: { memberId: createdMember.id },
  });

  revalidatePath("/visitantes");
  revalidatePath(`/visitantes/${visitorId}`);
  revalidatePath("/membros");

  return {
    ok: true,
    message: "Visitante convertido em membro com sucesso.",
    data: { memberId: createdMember.id },
  };
}
