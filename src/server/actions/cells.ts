"use server";

import { revalidatePath } from "next/cache";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import {
  cellMeetingAttendance,
  cellMeetings,
  cellMembers,
  cells,
  memberHistory,
} from "@/db/schema";
import { requirePermission } from "@/lib/session";
import {
  cellMeetingSchema,
  cellSchema,
  type AttendanceStatus,
} from "@/lib/validations";
import { isCellAllowedForSession } from "@/server/queries/cells";
import { logAudit } from "@/server/services/audit";
import type { ActionResult } from "./auth";

export async function createCell(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const session = await requirePermission("celulas", "criar");
  const parsed = cellSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  const [created] = await db
    .insert(cells)
    .values({
      ...parsed.data,
      coLeaderMemberId: parsed.data.coLeaderMemberId || null,
    })
    .returning({ id: cells.id });

  await logAudit({
    userId: session.user.id,
    acao: "criacao_celula",
    entidade: "cell",
    entidadeId: created.id,
    detalhes: { nome: parsed.data.name },
  });

  revalidatePath("/celulas");
  return {
    ok: true,
    message: "Célula criada com sucesso.",
    data: { id: created.id },
  };
}

export async function updateCell(
  id: string,
  input: unknown
): Promise<ActionResult> {
  const session = await requirePermission("celulas", "editar");

  const [existing] = await db
    .select()
    .from(cells)
    .where(and(eq(cells.id, id), isNull(cells.deletedAt)))
    .limit(1);

  if (!existing) return { ok: false, error: "Célula não encontrada." };
  if (!isCellAllowedForSession(session, existing)) {
    return { ok: false, error: "Acesso negado a esta célula." };
  }

  const parsed = cellSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  await db
    .update(cells)
    .set({
      ...parsed.data,
      coLeaderMemberId: parsed.data.coLeaderMemberId || null,
      updatedAt: new Date(),
    })
    .where(eq(cells.id, id));

  await logAudit({
    userId: session.user.id,
    acao: "edicao_celula",
    entidade: "cell",
    entidadeId: id,
  });

  revalidatePath("/celulas");
  revalidatePath(`/celulas/${id}`);
  return { ok: true, message: "Célula atualizada com sucesso." };
}

export async function addCellMember(
  cellId: string,
  memberId: string
): Promise<ActionResult> {
  const session = await requirePermission("celulas", "editar");

  const [cell] = await db
    .select()
    .from(cells)
    .where(and(eq(cells.id, cellId), isNull(cells.deletedAt)))
    .limit(1);

  if (!cell) return { ok: false, error: "Célula não encontrada." };
  if (!isCellAllowedForSession(session, cell)) {
    return { ok: false, error: "Acesso negado a esta célula." };
  }

  const today = new Date().toISOString().slice(0, 10);

  // Encerra vínculo ativo anterior se o membro estiver em outra célula
  const [previous] = await db
    .select()
    .from(cellMembers)
    .where(
      and(eq(cellMembers.memberId, memberId), isNull(cellMembers.leftAt))
    )
    .limit(1);

  if (previous) {
    if (previous.cellId === cellId) {
      return { ok: false, error: "Membro já está ativo nesta célula." };
    }

    await db
      .update(cellMembers)
      .set({ leftAt: today })
      .where(eq(cellMembers.id, previous.id));

    await db.insert(memberHistory).values({
      memberId,
      field: "celula",
      oldValue: previous.cellId,
      newValue: cellId,
      changedBy: session.user.id,
    });
  }

  await db.insert(cellMembers).values({
    cellId,
    memberId,
    joinedAt: today,
  });

  await logAudit({
    userId: session.user.id,
    acao: "adicao_membro_celula",
    entidade: "cell",
    entidadeId: cellId,
    detalhes: { memberId },
  });

  revalidatePath(`/celulas/${cellId}`);
  return { ok: true, message: "Membro adicionado à célula." };
}

export async function removeCellMember(
  cellId: string,
  linkId: string
): Promise<ActionResult> {
  const session = await requirePermission("celulas", "editar");

  const [cell] = await db
    .select()
    .from(cells)
    .where(and(eq(cells.id, cellId), isNull(cells.deletedAt)))
    .limit(1);

  if (!cell || !isCellAllowedForSession(session, cell)) {
    return { ok: false, error: "Acesso negado a esta célula." };
  }

  const today = new Date().toISOString().slice(0, 10);
  await db
    .update(cellMembers)
    .set({ leftAt: today })
    .where(eq(cellMembers.id, linkId));

  revalidatePath(`/celulas/${cellId}`);
  return { ok: true, message: "Membro removido da célula." };
}

export async function createCellMeeting(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const session = await requirePermission("celulas", "editar");
  const parsed = cellMeetingSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  const [cell] = await db
    .select()
    .from(cells)
    .where(and(eq(cells.id, parsed.data.cellId), isNull(cells.deletedAt)))
    .limit(1);

  if (!cell || !isCellAllowedForSession(session, cell)) {
    return { ok: false, error: "Acesso negado a esta célula." };
  }

  const [created] = await db
    .insert(cellMeetings)
    .values({
      ...parsed.data,
      notes: parsed.data.notes || null,
      createdBy: session.user.id,
    })
    .returning({ id: cellMeetings.id });

  await logAudit({
    userId: session.user.id,
    acao: "criacao_reuniao_celula",
    entidade: "cell_meeting",
    entidadeId: created.id,
    detalhes: { cellId: parsed.data.cellId, topic: parsed.data.topic },
  });

  revalidatePath(`/celulas/${parsed.data.cellId}`);
  return {
    ok: true,
    message: "Reunião registrada com sucesso.",
    data: { id: created.id },
  };
}

export async function saveCellAttendanceBatch(
  cellId: string,
  meetingId: string,
  entries: Array<{ memberId: string; status: AttendanceStatus }>
): Promise<ActionResult> {
  const session = await requirePermission("presenca", "editar");

  const [cell] = await db
    .select()
    .from(cells)
    .where(and(eq(cells.id, cellId), isNull(cells.deletedAt)))
    .limit(1);

  if (!cell || !isCellAllowedForSession(session, cell)) {
    return { ok: false, error: "Acesso negado a esta célula." };
  }

  await db
    .delete(cellMeetingAttendance)
    .where(eq(cellMeetingAttendance.cellMeetingId, meetingId));

  if (entries.length > 0) {
    await db.insert(cellMeetingAttendance).values(
      entries.map((e) => ({
        cellMeetingId: meetingId,
        memberId: e.memberId,
        status: e.status,
      }))
    );
  }

  await logAudit({
    userId: session.user.id,
    acao: "registro_presenca_celula",
    entidade: "cell_meeting",
    entidadeId: meetingId,
    detalhes: { total: entries.length },
  });

  revalidatePath(`/celulas/${cellId}`);
  return { ok: true, message: "Presença salva com sucesso." };
}

export async function getCellMeetingAttendanceAction(meetingId: string) {
  await requirePermission("celulas", "ver");
  return db
    .select({
      memberId: cellMeetingAttendance.memberId,
      status: cellMeetingAttendance.status,
    })
    .from(cellMeetingAttendance)
    .where(eq(cellMeetingAttendance.cellMeetingId, meetingId));
}
