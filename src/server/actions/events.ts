"use server";

import { revalidatePath } from "next/cache";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { events, visitorVisits } from "@/db/schema";
import { requirePermission } from "@/lib/session";
import { eventSchema } from "@/lib/validations";
import { logAudit } from "@/server/services/audit";
import type { ActionResult } from "./auth";

export async function createEvent(
  input: unknown
): Promise<ActionResult<{ id: string; count: number }>> {
  const session = await requirePermission("cultos", "criar");
  const parsed = eventSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  const baseStart = new Date(parsed.data.startsAt);
  const baseEnd = parsed.data.endsAt ? new Date(parsed.data.endsAt) : null;
  const weeks = parsed.data.repeatWeeks ?? 1;

  const rowsToInsert = Array.from({ length: weeks }, (_, idx) => {
    const offsetMs = idx * 7 * 24 * 60 * 60 * 1000;
    return {
      title: parsed.data.title,
      eventType: parsed.data.eventType,
      startsAt: new Date(baseStart.getTime() + offsetMs),
      endsAt: baseEnd ? new Date(baseEnd.getTime() + offsetMs) : null,
      location: parsed.data.location || null,
      theme: parsed.data.theme || null,
      preacherText: parsed.data.preacherText || null,
      preacherMemberId: parsed.data.preacherMemberId || null,
      description: parsed.data.description || null,
      responsibleUserId: session.user.id,
      status: "agendado",
    };
  });

  const inserted = await db
    .insert(events)
    .values(rowsToInsert)
    .returning({ id: events.id });

  await logAudit({
    userId: session.user.id,
    acao: "criacao_evento",
    entidade: "event",
    entidadeId: inserted[0].id,
    detalhes: { title: parsed.data.title, occurrences: weeks },
  });

  revalidatePath("/cultos");
  return {
    ok: true,
    message:
      weeks > 1
        ? `${weeks} ocorrências criadas com sucesso.`
        : "Evento criado com sucesso.",
    data: { id: inserted[0].id, count: weeks },
  };
}

export async function updateEvent(
  id: string,
  input: unknown
): Promise<ActionResult> {
  const session = await requirePermission("cultos", "editar");
  const parsed = eventSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  await db
    .update(events)
    .set({
      title: parsed.data.title,
      eventType: parsed.data.eventType,
      startsAt: new Date(parsed.data.startsAt),
      endsAt: parsed.data.endsAt ? new Date(parsed.data.endsAt) : null,
      location: parsed.data.location || null,
      theme: parsed.data.theme || null,
      preacherText: parsed.data.preacherText || null,
      preacherMemberId: parsed.data.preacherMemberId || null,
      description: parsed.data.description || null,
      updatedAt: new Date(),
    })
    .where(and(eq(events.id, id), isNull(events.deletedAt)));

  await logAudit({
    userId: session.user.id,
    acao: "edicao_evento",
    entidade: "event",
    entidadeId: id,
  });

  revalidatePath("/cultos");
  revalidatePath(`/cultos/${id}`);
  return { ok: true, message: "Evento atualizado com sucesso." };
}

export async function markEventDone(id: string): Promise<ActionResult> {
  const session = await requirePermission("cultos", "editar");

  await db
    .update(events)
    .set({ status: "realizado", updatedAt: new Date() })
    .where(eq(events.id, id));

  await logAudit({
    userId: session.user.id,
    acao: "evento_realizado",
    entidade: "event",
    entidadeId: id,
  });

  revalidatePath("/cultos");
  revalidatePath(`/cultos/${id}`);
  return { ok: true, message: "Evento marcado como realizado." };
}

export async function cancelEvent(
  id: string,
  reason: string
): Promise<ActionResult> {
  const session = await requirePermission("cultos", "editar");
  if (!reason.trim()) {
    return { ok: false, error: "Informe o motivo do cancelamento." };
  }

  await db
    .update(events)
    .set({
      status: "cancelado",
      cancelReason: reason.trim(),
      updatedAt: new Date(),
    })
    .where(eq(events.id, id));

  await logAudit({
    userId: session.user.id,
    acao: "cancelamento_evento",
    entidade: "event",
    entidadeId: id,
    detalhes: { reason: reason.trim() },
  });

  revalidatePath("/cultos");
  revalidatePath(`/cultos/${id}`);
  return { ok: true, message: "Evento cancelado." };
}

export async function duplicateEvent(
  id: string
): Promise<ActionResult<{ id: string }>> {
  const session = await requirePermission("cultos", "criar");

  const [existing] = await db
    .select()
    .from(events)
    .where(and(eq(events.id, id), isNull(events.deletedAt)))
    .limit(1);

  if (!existing) return { ok: false, error: "Evento não encontrado." };

  const nextWeek = 7 * 24 * 60 * 60 * 1000;
  const [created] = await db
    .insert(events)
    .values({
      title: `${existing.title} (Cópia)`,
      eventType: existing.eventType,
      startsAt: new Date(existing.startsAt.getTime() + nextWeek),
      endsAt: existing.endsAt
        ? new Date(existing.endsAt.getTime() + nextWeek)
        : null,
      location: existing.location,
      theme: existing.theme,
      preacherText: existing.preacherText,
      preacherMemberId: existing.preacherMemberId,
      description: existing.description,
      responsibleUserId: session.user.id,
      status: "agendado",
    })
    .returning({ id: events.id });

  revalidatePath("/cultos");
  return {
    ok: true,
    message: "Evento duplicado para a próxima semana.",
    data: { id: created.id },
  };
}

export async function linkVisitorToEvent(
  eventId: string,
  visitorId: string
): Promise<ActionResult> {
  const session = await requirePermission("visitantes", "editar");

  const [event] = await db
    .select({ startsAt: events.startsAt })
    .from(events)
    .where(eq(events.id, eventId))
    .limit(1);

  if (!event) return { ok: false, error: "Evento não encontrado." };

  await db.insert(visitorVisits).values({
    visitorId,
    eventId,
    visitedAt: event.startsAt,
    notes: "Vinculado ao culto/evento",
  });

  await logAudit({
    userId: session.user.id,
    acao: "vinculo_visitante_evento",
    entidade: "event",
    entidadeId: eventId,
    detalhes: { visitorId },
  });

  revalidatePath(`/cultos/${eventId}`);
  return { ok: true, message: "Visitante vinculado ao evento." };
}
