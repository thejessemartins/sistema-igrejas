import { asc, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { journeyStages, memberJourney, members } from "@/db/schema";
import { seedJourneyStagesIfEmpty } from "@/server/actions/journey";

/**
 * Regra única: a etapa atual do membro é a de maior position sem completedAt;
 * se todas estiverem concluídas, usa-se a última concluída.
 */
export async function getJourneyBoard(staleDays = 90) {
  await seedJourneyStagesIfEmpty();

  const [stages, activeMembers, entries] = await Promise.all([
    db
      .select()
      .from(journeyStages)
      .where(eq(journeyStages.isActive, true))
      .orderBy(asc(journeyStages.position)),
    db
      .select({ id: members.id, fullName: members.fullName })
      .from(members)
      .where(isNull(members.deletedAt))
      .orderBy(asc(members.fullName)),
    db.select().from(memberJourney),
  ]);

  const stageMap = new Map(stages.map((s) => [s.id, s]));
  const now = Date.now();
  const staleMs = staleDays * 24 * 60 * 60 * 1000;

  const memberCurrentStage = activeMembers.map((m) => {
    const mEntries = entries.filter((e) => e.memberId === m.id);
    const open = mEntries
      .filter((e) => !e.completedAt)
      .sort(
        (a, b) =>
          (stageMap.get(b.stageId)?.position ?? 0) -
          (stageMap.get(a.stageId)?.position ?? 0)
      );
    const current = open[0] ?? mEntries[mEntries.length - 1] ?? null;
    const isStale = current
      ? !current.completedAt && now - new Date(current.enteredAt).getTime() > staleMs
      : false;

    return {
      memberId: m.id,
      fullName: m.fullName,
      currentStageId: current?.stageId ?? null,
      enteredAt: current?.enteredAt ?? null,
      isStale,
    };
  });

  return { stages, memberCurrentStage };
}
