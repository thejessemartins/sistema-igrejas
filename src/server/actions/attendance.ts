"use server";

import { revalidatePath } from "next/cache";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { attendances, events } from "@/db/schema";
import { requirePermission } from "@/lib/session";
import type { AttendanceStatus } from "@/lib/validations";
import { logAudit } from "@/server/services/audit";
import type { ActionResult } from "./auth";

export interface AttendanceEntryInput {
  memberId?: string | null;
  visitorId?: string | null;
  personNameSnapshot: string;
  status: AttendanceStatus;
}

export async function saveEventAttendanceBatch(
  eventId: string,
  entries: AttendanceEntryInput[]
): Promise<ActionResult> {
  const session = await requirePermission("presenca", "editar");

  const [event] = await db
    .select({ id: events.id, status: events.status })
    .from(events)
    .where(and(eq(events.id, eventId), isNull(events.deletedAt)))
    .limit(1);

  if (!event) {
    return { ok: false, error: "Evento não encontrado." };
  }

  if (event.status === "cancelado") {
    return {
      ok: false,
      error: "Não é possível registrar chamada para evento cancelado.",
    };
  }

  await db.transaction(async (tx) => {
    await tx.delete(attendances).where(eq(attendances.eventId, eventId));

    if (entries.length > 0) {
      await tx.insert(attendances).values(
        entries.map((e) => ({
          eventId,
          memberId: e.memberId ?? null,
          visitorId: e.visitorId ?? null,
          personNameSnapshot: e.personNameSnapshot,
          status: e.status,
          checkedBy: session.user.id,
        }))
      );
    }
  });

  await logAudit({
    userId: session.user.id,
    acao: "registro_chamada_culto",
    entidade: "event",
    entidadeId: eventId,
    detalhes: { total: entries.length },
  });

  revalidatePath("/presenca");
  revalidatePath(`/presenca/${eventId}`);
  revalidatePath(`/cultos/${eventId}`);
  return { ok: true, message: "Chamada salva com sucesso." };
}
