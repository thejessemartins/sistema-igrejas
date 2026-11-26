"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { sermons } from "@/db/schema";
import { requirePermission } from "@/lib/session";
import { logAudit } from "@/server/services/audit";
import type { ActionResult } from "./auth";

export async function createSermon(input: {
  title: string;
  preacherText?: string;
  preachedAt: string;
  bibleReference?: string;
  seriesName?: string;
  summary?: string;
  isPublished?: boolean;
}): Promise<ActionResult<{ id: string }>> {
  const session = await requirePermission("cultos", "criar");
  if (!input.title.trim()) {
    return { ok: false, error: "Título do sermão é obrigatório." };
  }

  const [created] = await db
    .insert(sermons)
    .values({
      title: input.title.trim(),
      preacherText: input.preacherText?.trim() || null,
      preachedAt: input.preachedAt,
      bibleReference: input.bibleReference?.trim() || null,
      seriesName: input.seriesName?.trim() || null,
      summary: input.summary?.trim() || null,
      isPublished: input.isPublished ?? true,
    })
    .returning({ id: sermons.id });

  await logAudit({
    userId: session.user.id,
    acao: "criacao_sermao",
    entidade: "sermon",
    entidadeId: created.id,
  });

  revalidatePath("/sermoes");
  return {
    ok: true,
    message: "Sermão cadastrado com sucesso.",
    data: { id: created.id },
  };
}
