"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  ceremonies,
  ceremonyParticipants,
  events,
  memberHistory,
  members,
} from "@/db/schema";
import { requirePermission } from "@/lib/session";
import { logAudit } from "@/server/services/audit";
import type { ActionResult } from "./auth";

export async function confirmCeremony(id: string): Promise<ActionResult> {
  const session = await requirePermission("cultos", "editar");

  const [ceremony] = await db
    .select()
    .from(ceremonies)
    .where(eq(ceremonies.id, id))
    .limit(1);

  if (!ceremony) return { ok: false, error: "Cerimônia não encontrada." };

  let eventId = ceremony.eventId;
  if (!eventId) {
    const [ev] = await db
      .insert(events)
      .values({
        title: ceremony.title,
        eventType: ceremony.kind === "batismo" ? "batismo" : "evento_especial",
        startsAt: ceremony.scheduledAt ?? new Date(),
        status: "agendado",
        responsibleUserId: session.user.id,
      })
      .returning({ id: events.id });
    eventId = ev.id;
  }

  await db
    .update(ceremonies)
    .set({ status: "confirmada", eventId, updatedAt: new Date() })
    .where(eq(ceremonies.id, id));

  await logAudit({
    userId: session.user.id,
    acao: "confirmacao_cerimonia",
    entidade: "ceremony",
    entidadeId: id,
  });

  revalidatePath("/cerimonias");
  revalidatePath(`/cerimonias/${id}`);
  return { ok: true, message: "Cerimônia confirmada e vinculada à agenda." };
}

export async function markCeremonyDone(id: string): Promise<ActionResult> {
  const session = await requirePermission("cultos", "editar");

  const [ceremony] = await db
    .select()
    .from(ceremonies)
    .where(eq(ceremonies.id, id))
    .limit(1);

  if (!ceremony) return { ok: false, error: "Cerimônia não encontrada." };

  await db
    .update(ceremonies)
    .set({ status: "realizada", updatedAt: new Date() })
    .where(eq(ceremonies.id, id));

  if (ceremony.kind === "batismo") {
    const participants = await db
      .select()
      .from(ceremonyParticipants)
      .where(eq(ceremonyParticipants.ceremonyId, id));

    const dateStr = (ceremony.scheduledAt ?? new Date())
      .toISOString()
      .slice(0, 10);

    for (const p of participants) {
      if (p.memberId && p.roleInCeremony === "batizando") {
        await db
          .update(members)
          .set({ baptismDate: dateStr, updatedAt: new Date() })
          .where(eq(members.id, p.memberId));

        await db.insert(memberHistory).values({
          memberId: p.memberId,
          field: "baptismDate",
          oldValue: null,
          newValue: dateStr,
          changedBy: session.user.id,
        });
      }
    }
  }

  revalidatePath("/cerimonias");
  revalidatePath(`/cerimonias/${id}`);
  return { ok: true, message: "Cerimônia marcada como realizada." };
}
