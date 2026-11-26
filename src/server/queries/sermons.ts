import { and, desc, eq, ilike, isNull, or } from "drizzle-orm";
import { db } from "@/db";
import { sermons } from "@/db/schema";
import { requireSession, type AppSession } from "@/lib/session";

export async function getSermons(
  session: AppSession,
  params: { search?: string } = {}
) {
  await requireSession();

  const conditions = [isNull(sermons.deletedAt)];
  if (session.user.role === "voluntario") {
    conditions.push(eq(sermons.isPublished, true));
  }

  if (params.search?.trim()) {
    const term = `%${params.search.trim()}%`;
    conditions.push(
      or(
        ilike(sermons.title, term),
        ilike(sermons.preacherText, term),
        ilike(sermons.bibleReference, term),
        ilike(sermons.seriesName, term)
      )!
    );
  }

  return db
    .select()
    .from(sermons)
    .where(and(...conditions))
    .orderBy(desc(sermons.preachedAt));
}

export async function getSermonById(id: string, session: AppSession) {
  await requireSession();

  const [sermon] = await db
    .select()
    .from(sermons)
    .where(and(eq(sermons.id, id), isNull(sermons.deletedAt)))
    .limit(1);

  if (!sermon) return null;
  if (session.user.role === "voluntario" && !sermon.isPublished) {
    return null;
  }

  return sermon;
}
