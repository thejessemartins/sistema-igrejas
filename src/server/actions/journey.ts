"use server";

import { revalidatePath } from "next/cache";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { journeyStages, memberHistory, memberJourney } from "@/db/schema";
import { requireSession } from "@/lib/session";
import type { ActionResult } from "./auth";

const DEFAULT_STAGES = [
  "Visitante",
  "Novo convertido",
  "Classe de integração",
  "Batismo",
  "Membro ativo",
  "Em célula",
  "Servindo em ministério",
  "Liderança em formação",
];

export async function seedJourneyStagesIfEmpty() {
  const existing = await db.select({ id: journeyStages.id }).from(journeyStages).limit(1);
  if (existing.length > 0) return;

  await db.insert(journeyStages).values(
    DEFAULT_STAGES.map((name, i) => ({
      name,
      position: i + 1,
      isActive: true,
    }))
  );
}

export async function advanceMemberStage(
  memberId: string,
  stageId: string,
  notes?: string
): Promise<ActionResult> {
  const session = await requireSession();

  await db.transaction(async (tx) => {
    await tx
      .update(memberJourney)
      .set({ completedAt: new Date() })
      .where(
        and(
          eq(memberJourney.memberId, memberId),
          isNull(memberJourney.completedAt)
        )
      );

    await tx.insert(memberJourney).values({
      memberId,
      stageId,
      responsibleUserId: session.user.id,
      notes: notes || null,
    });

    await tx.insert(memberHistory).values({
      memberId,
      field: "jornada_etapa",
      newValue: stageId,
      changedBy: session.user.id,
    });
  });

  revalidatePath("/membros/jornada");
  revalidatePath(`/membros/${memberId}`);
  return { ok: true, message: "Etapa da jornada atualizada." };
}
