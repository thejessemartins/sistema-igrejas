"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { userPreferences } from "@/db/schema";
import { requireSession } from "@/lib/session";
import type { ActionResult } from "./auth";

const prefsSchema = z.object({
  fontSizeScale: z.enum(["padrao", "maior", "muito_maior"]),
  reduceMotion: z.boolean(),
  highContrastText: z.boolean(),
  simplifiedLists: z.boolean(),
  locale: z.enum(["pt-BR", "es", "en"]),
});

export async function getUserPreferences() {
  const session = await requireSession();
  const [prefs] = await db
    .select()
    .from(userPreferences)
    .where(eq(userPreferences.userId, session.user.id))
    .limit(1);

  return (
    prefs ?? {
      fontSizeScale: "padrao",
      reduceMotion: false,
      highContrastText: false,
      simplifiedLists: false,
      locale: "pt-BR",
    }
  );
}

export async function saveUserPreferences(
  input: unknown
): Promise<ActionResult> {
  const session = await requireSession();
  const parsed = prefsSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  await db
    .insert(userPreferences)
    .values({
      userId: session.user.id,
      ...parsed.data,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: userPreferences.userId,
      set: { ...parsed.data, updatedAt: new Date() },
    });

  revalidatePath("/acessibilidade");
  revalidatePath("/painel");
  return { ok: true, message: "Preferências salvas." };
}
