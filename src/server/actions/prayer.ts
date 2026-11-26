"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { prayerCommitments, prayerRequests } from "@/db/schema";
import { requireSession } from "@/lib/session";
import type { ActionResult } from "./auth";

export async function createPrayerRequest(input: {
  title: string;
  body: string;
  visibility: "publico" | "intercessores" | "pastoral";
  isAnonymous: boolean;
}): Promise<ActionResult<{ id: string }>> {
  const session = await requireSession();
  if (!input.title.trim() || !input.body.trim()) {
    return { ok: false, error: "Título e pedido são obrigatórios." };
  }

  const [created] = await db
    .insert(prayerRequests)
    .values({
      authorUserId: session.user.id,
      authorMemberId: session.user.memberId,
      authorText: session.user.name,
      title: input.title.trim(),
      body: input.body.trim(),
      visibility: input.visibility,
      isAnonymous: input.isAnonymous,
      status: "ativo",
    })
    .returning({ id: prayerRequests.id });

  revalidatePath("/oracao");
  return {
    ok: true,
    message: "Pedido de oração registrado.",
    data: { id: created.id },
  };
}

export async function registerPrayerCommitment(
  prayerRequestId: string
): Promise<ActionResult> {
  const session = await requireSession();
  const today = new Date().toISOString().slice(0, 10);

  await db
    .insert(prayerCommitments)
    .values({
      prayerRequestId,
      userId: session.user.id,
      prayedDay: today,
    })
    .onConflictDoNothing();

  revalidatePath(`/oracao/${prayerRequestId}`);
  return { ok: true, message: "Oração registrada hoje." };
}

export async function markPrayerAnswered(
  id: string,
  notes: string
): Promise<ActionResult> {
  const session = await requireSession();
  if (!["admin", "pastor"].includes(session.user.role)) {
    return { ok: false, error: "Sem permissão para marcar como atendido." };
  }

  await db
    .update(prayerRequests)
    .set({
      status: "atendido",
      answeredNotes: notes || null,
      updatedAt: new Date(),
    })
    .where(eq(prayerRequests.id, id));

  revalidatePath("/oracao");
  revalidatePath(`/oracao/${id}`);
  return { ok: true, message: "Pedido marcado como atendido." };
}
