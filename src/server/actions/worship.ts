"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { worshipSetlistItems, worshipSetlists, worshipSongs } from "@/db/schema";
import { requireSession } from "@/lib/session";
import type { ActionResult } from "./auth";

const songSchema = z.object({
  title: z.string().trim().min(2, "Título obrigatório"),
  authorText: z.string().trim().optional().nullable(),
  musicalKey: z.string().trim().optional().nullable(),
  themeTags: z.string().trim().optional().nullable(),
  lyricsText: z.string().trim().optional().nullable(),
});

export async function createWorshipSong(input: unknown): Promise<ActionResult> {
  await requireSession();
  const parsed = songSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  await db.insert(worshipSongs).values({
    title: parsed.data.title,
    authorText: parsed.data.authorText || null,
    musicalKey: parsed.data.musicalKey || null,
    themeTags: parsed.data.themeTags || null,
    lyricsText: parsed.data.lyricsText || null,
  });

  revalidatePath("/louvor/musicas");
  revalidatePath("/louvor/setlists");
  return { ok: true, message: "Música cadastrada." };
}

export async function createSetlist(
  eventId: string,
  title: string
): Promise<ActionResult> {
  const session = await requireSession();
  await db
    .insert(worshipSetlists)
    .values({ eventId, title, createdBy: session.user.id })
    .onConflictDoNothing();

  revalidatePath("/louvor/setlists");
  return { ok: true, message: "Setlist criada." };
}

export async function addSongToSetlist(
  setlistId: string,
  songId: string,
  musicalKeyOverride?: string
): Promise<ActionResult> {
  await requireSession();
  const existing = await db
    .select({ id: worshipSetlistItems.id })
    .from(worshipSetlistItems)
    .where(eq(worshipSetlistItems.setlistId, setlistId));

  await db
    .insert(worshipSetlistItems)
    .values({
      setlistId,
      songId,
      position: existing.length + 1,
      musicalKeyOverride: musicalKeyOverride || null,
    })
    .onConflictDoNothing();

  revalidatePath("/louvor/setlists");
  return { ok: true, message: "Música adicionada à setlist." };
}
