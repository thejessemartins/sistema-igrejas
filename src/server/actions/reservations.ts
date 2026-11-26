"use server";

import { revalidatePath } from "next/cache";
import { and, eq, gt, isNull, lt } from "drizzle-orm";
import { db } from "@/db";
import { reservations } from "@/db/schema";
import { requireSession } from "@/lib/session";
import { logAudit } from "@/server/services/audit";
import type { ActionResult } from "./auth";

export async function createReservation(input: {
  resourceId: string;
  title: string;
  startsAt: string;
  endsAt: string;
}): Promise<ActionResult> {
  const session = await requireSession();

  if (!input.title.trim()) {
    return { ok: false, error: "Título da reserva é obrigatório." };
  }

  const start = new Date(input.startsAt);
  const end = new Date(input.endsAt);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
    return { ok: false, error: "Data/hora de término deve ser maior que a de início." };
  }

  // Bloqueia sobreposição com reserva aprovada do mesmo recurso
  const conflicts = await db
    .select({ id: reservations.id, title: reservations.title })
    .from(reservations)
    .where(
      and(
        eq(reservations.resourceId, input.resourceId),
        eq(reservations.status, "aprovada"),
        isNull(reservations.deletedAt),
        lt(reservations.startsAt, end),
        gt(reservations.endsAt, start)
      )
    )
    .limit(1);

  if (conflicts.length > 0) {
    return {
      ok: false,
      error: `Conflito de horário com reserva aprovada: "${conflicts[0].title}".`,
    };
  }

  const [created] = await db
    .insert(reservations)
    .values({
      resourceId: input.resourceId,
      title: input.title.trim(),
      requestedByUserId: session.user.id,
      startsAt: start,
      endsAt: end,
      status: "pendente",
    })
    .returning({ id: reservations.id });

  await logAudit({
    userId: session.user.id,
    acao: "solicitacao_reserva",
    entidade: "reservation",
    entidadeId: created.id,
  });

  revalidatePath("/reservas");
  return { ok: true, message: "Reserva solicitada com sucesso." };
}

export async function decideReservation(
  id: string,
  decision: "aprovada" | "recusada",
  notes = ""
): Promise<ActionResult> {
  const session = await requireSession();
  if (!["admin", "pastor", "secretario"].includes(session.user.role)) {
    return { ok: false, error: "Sem permissão para aprovar/recusar reservas." };
  }

  await db
    .update(reservations)
    .set({
      status: decision,
      approverUserId: session.user.id,
      decisionNotes: notes || null,
      updatedAt: new Date(),
    })
    .where(eq(reservations.id, id));

  await logAudit({
    userId: session.user.id,
    acao: `reserva_${decision}`,
    entidade: "reservation",
    entidadeId: id,
    detalhes: { notes },
  });

  revalidatePath("/reservas");
  return { ok: true, message: `Reserva ${decision}.` };
}

export async function cancelReservation(id: string): Promise<ActionResult> {
  const session = await requireSession();

  const [res] = await db
    .select()
    .from(reservations)
    .where(eq(reservations.id, id))
    .limit(1);

  if (!res) return { ok: false, error: "Reserva não encontrada." };
  if (
    res.requestedByUserId !== session.user.id &&
    session.user.role !== "admin"
  ) {
    return { ok: false, error: "Você só pode cancelar suas próprias reservas." };
  }

  await db
    .update(reservations)
    .set({ status: "cancelada", updatedAt: new Date() })
    .where(eq(reservations.id, id));

  revalidatePath("/reservas");
  return { ok: true, message: "Reserva cancelada." };
}
