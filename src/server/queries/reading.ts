import { and, asc, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import {
  readingPlanDays,
  readingPlans,
  readingProgress,
} from "@/db/schema";
import { requireSession, type AppSession } from "@/lib/session";

export async function getReadingPlans(session: AppSession) {
  await requireSession();

  const plans = await db
    .select()
    .from(readingPlans)
    .where(and(eq(readingPlans.isActive, true), isNull(readingPlans.deletedAt)));

  const progress = await db
    .select()
    .from(readingProgress)
    .where(eq(readingProgress.userId, session.user.id));

  return plans.map((p) => {
    const completed = progress.filter((pr) => pr.planId === p.id).length;
    const pct =
      p.durationDays > 0 ? Math.round((completed / p.durationDays) * 100) : 0;
    return { ...p, completed, pct };
  });
}

export async function getReadingPlanById(planId: string, session: AppSession) {
  await requireSession();

  const [plan] = await db
    .select()
    .from(readingPlans)
    .where(and(eq(readingPlans.id, planId), isNull(readingPlans.deletedAt)))
    .limit(1);

  if (!plan) return null;

  const [days, progress] = await Promise.all([
    db
      .select()
      .from(readingPlanDays)
      .where(eq(readingPlanDays.planId, planId))
      .orderBy(asc(readingPlanDays.dayNumber)),
    db
      .select({ dayNumber: readingProgress.dayNumber })
      .from(readingProgress)
      .where(
        and(
          eq(readingProgress.planId, planId),
          eq(readingProgress.userId, session.user.id)
        )
      ),
  ]);

  return {
    plan,
    days,
    completedDays: progress.map((p) => p.dayNumber),
  };
}
