"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { readingProgress } from "@/db/schema";
import { requireSession } from "@/lib/session";
import type { ActionResult } from "./auth";

export async function toggleReadingDay(
  planId: string,
  dayNumber: number,
  completed: boolean
): Promise<ActionResult> {
  const session = await requireSession();

  if (completed) {
    await db
      .insert(readingProgress)
      .values({
        userId: session.user.id,
        memberId: session.user.memberId,
        planId,
        dayNumber,
      })
      .onConflictDoNothing();
  } else {
    await db
      .delete(readingProgress)
      .where(
        and(
          eq(readingProgress.userId, session.user.id),
          eq(readingProgress.planId, planId),
          eq(readingProgress.dayNumber, dayNumber)
        )
      );
  }

  revalidatePath("/leitura");
  revalidatePath(`/leitura/${planId}`);
  return { ok: true, message: "Progresso atualizado." };
}
