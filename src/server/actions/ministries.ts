"use server";

import { revalidatePath } from "next/cache";
import { and, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import {
  ministries,
  ministryMembers,
  scheduleAssignments,
  schedules,
} from "@/db/schema";
import { requirePermission } from "@/lib/session";
import { ministrySchema, scheduleSchema } from "@/lib/validations";
import { logAudit } from "@/server/services/audit";
import type { ActionResult } from "./auth";

export async function createMinistry(input: unknown): Promise<ActionResult> {
  const session = await requirePermission("ministerios", "criar");
  const parsed = ministrySchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  const [created] = await db
    .insert(ministries)
    .values({
      ...parsed.data,
      leaderMemberId: parsed.data.leaderMemberId || null,
    })
    .returning({ id: ministries.id });

  await logAudit({
    userId: session.user.id,
    acao: "criacao_ministerio",
    entidade: "ministry",
    entidadeId: created.id,
    detalhes: { name: parsed.data.name },
  });

  revalidatePath("/ministerios");
  return { ok: true, message: "Ministério criado com sucesso." };
}

export async function addMinistryMember(
  ministryId: string,
  memberId: string,
  roleInMinistry: string
): Promise<ActionResult> {
  const session = await requirePermission("ministerios", "editar");
  if (!roleInMinistry.trim()) {
    return { ok: false, error: "Informe a função no ministério." };
  }

  await db.insert(ministryMembers).values({
    ministryId,
    memberId,
    roleInMinistry: roleInMinistry.trim(),
    joinedAt: new Date().toISOString().slice(0, 10),
  });

  await logAudit({
    userId: session.user.id,
    acao: "adicao_voluntario_ministerio",
    entidade: "ministry",
    entidadeId: ministryId,
    detalhes: { memberId, roleInMinistry },
  });

  revalidatePath(`/ministerios/${ministryId}`);
  return { ok: true, message: "Voluntário adicionado ao ministério." };
}

export async function removeMinistryMember(
  ministryId: string,
  linkId: string
): Promise<ActionResult> {
  await requirePermission("ministerios", "editar");

  await db
    .update(ministryMembers)
    .set({ leftAt: new Date().toISOString().slice(0, 10) })
    .where(eq(ministryMembers.id, linkId));

  revalidatePath(`/ministerios/${ministryId}`);
  return { ok: true, message: "Voluntário removido do ministério." };
}

export async function createSchedule(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const session = await requirePermission("escalas", "criar");
  const parsed = scheduleSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  const [created] = await db
    .insert(schedules)
    .values({
      ...parsed.data,
      notes: parsed.data.notes || null,
    })
    .returning({ id: schedules.id });

  await logAudit({
    userId: session.user.id,
    acao: "criacao_escala",
    entidade: "schedule",
    entidadeId: created.id,
  });

  revalidatePath("/escalas");
  return {
    ok: true,
    message: "Escala criada com sucesso.",
    data: { id: created.id },
  };
}

export async function addScheduleAssignment(
  scheduleId: string,
  memberId: string,
  assignmentRole: string,
  forceConflict = false
): Promise<ActionResult> {
  const session = await requirePermission("escalas", "editar");

  const [schedule] = await db
    .select({ eventId: schedules.eventId })
    .from(schedules)
    .where(eq(schedules.id, scheduleId))
    .limit(1);

  if (!schedule) return { ok: false, error: "Escala não encontrada." };

  if (!forceConflict) {
    const conflicts = await db
      .select({ id: scheduleAssignments.id })
      .from(scheduleAssignments)
      .innerJoin(schedules, eq(scheduleAssignments.scheduleId, schedules.id))
      .where(
        and(
          eq(schedules.eventId, schedule.eventId),
          eq(scheduleAssignments.memberId, memberId),
          ne(scheduleAssignments.status, "cancelado"),
          ne(scheduleAssignments.status, "substituido")
        )
      )
      .limit(1);

    if (conflicts.length > 0) {
      return {
        ok: false,
        error:
          "Conflito detectado: este voluntário já está escalado neste mesmo culto/evento. Confirme para adicionar mesmo assim.",
      };
    }
  }

  await db.insert(scheduleAssignments).values({
    scheduleId,
    memberId,
    assignmentRole: assignmentRole.trim() || "Voluntário",
    status: "pendente",
  });

  await logAudit({
    userId: session.user.id,
    acao: "adicao_voluntario_escala",
    entidade: "schedule",
    entidadeId: scheduleId,
    detalhes: { memberId, assignmentRole },
  });

  revalidatePath(`/escalas/${scheduleId}`);
  return { ok: true, message: "Voluntário escalado com sucesso." };
}

export async function replaceScheduleAssignment(
  scheduleId: string,
  assignmentId: string,
  replacedByMemberId: string
): Promise<ActionResult> {
  const session = await requirePermission("escalas", "editar");

  await db
    .update(scheduleAssignments)
    .set({
      status: "substituido",
      replacedByMemberId,
    })
    .where(eq(scheduleAssignments.id, assignmentId));

  await logAudit({
    userId: session.user.id,
    acao: "substituicao_voluntario_escala",
    entidade: "schedule",
    entidadeId: scheduleId,
    detalhes: { assignmentId, replacedByMemberId },
  });

  revalidatePath(`/escalas/${scheduleId}`);
  return { ok: true, message: "Substituição registrada." };
}
