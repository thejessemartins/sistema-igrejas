"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { noticeReads, notices } from "@/db/schema";
import { requirePermission } from "@/lib/session";
import { noticeSchema } from "@/lib/validations";
import { logAudit } from "@/server/services/audit";
import type { ActionResult } from "./auth";

export async function createNotice(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const session = await requirePermission("avisos", "criar");
  const parsed = noticeSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  if (
    session.user.role === "lider_celula" &&
    parsed.data.audienceType !== "celula"
  ) {
    return {
      ok: false,
      error: "Líder de célula só pode publicar avisos para sua célula.",
    };
  }

  const [created] = await db
    .insert(notices)
    .values({
      title: parsed.data.title,
      body: parsed.data.body,
      audienceType: parsed.data.audienceType,
      ministryId: parsed.data.ministryId || null,
      cellId: parsed.data.cellId || null,
      priority: parsed.data.priority,
      publishAt: parsed.data.publishAt
        ? new Date(parsed.data.publishAt)
        : new Date(),
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
      isPinned: parsed.data.isPinned,
      authorUserId: session.user.id,
    })
    .returning({ id: notices.id });

  await logAudit({
    userId: session.user.id,
    acao: "criacao_aviso",
    entidade: "notice",
    entidadeId: created.id,
    detalhes: { title: parsed.data.title, audience: parsed.data.audienceType },
  });

  revalidatePath("/avisos");
  return {
    ok: true,
    message: "Aviso publicado com sucesso.",
    data: { id: created.id },
  };
}

export async function markNoticeAsRead(noticeId: string): Promise<void> {
  const session = await requirePermission("avisos", "ver");

  await db
    .insert(noticeReads)
    .values({
      noticeId,
      userId: session.user.id,
    })
    .onConflictDoNothing();
}
