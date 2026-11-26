import { and, desc, eq, inArray, isNull } from "drizzle-orm";
import { db } from "@/db";
import { prayerRequests } from "@/db/schema";
import { requireSession, type AppSession } from "@/lib/session";

function allowedVisibilities(session: AppSession): string[] {
  const list = ["publico"];
  if (
    ["admin", "pastor", "secretario", "lider_celula"].includes(
      session.user.role
    )
  ) {
    list.push("intercessores");
  }
  if (["admin", "pastor"].includes(session.user.role)) {
    list.push("pastoral");
  }
  return list;
}

export async function getPrayerRequests(session: AppSession) {
  await requireSession();
  const vis = allowedVisibilities(session);

  const rows = await db
    .select()
    .from(prayerRequests)
    .where(
      and(
        isNull(prayerRequests.deletedAt),
        inArray(prayerRequests.visibility, vis)
      )
    )
    .orderBy(desc(prayerRequests.createdAt));

  return rows.map((r) => ({
    ...r,
    authorDisplay:
      r.isAnonymous && !["admin", "pastor"].includes(session.user.role)
        ? "Anônimo"
        : r.authorText ?? "Membro",
  }));
}

export async function getPrayerRequestById(id: string, session: AppSession) {
  await requireSession();
  const vis = allowedVisibilities(session);

  const [row] = await db
    .select()
    .from(prayerRequests)
    .where(
      and(
        eq(prayerRequests.id, id),
        isNull(prayerRequests.deletedAt),
        inArray(prayerRequests.visibility, vis)
      )
    )
    .limit(1);

  if (!row) return null;

  return {
    ...row,
    authorDisplay:
      row.isAnonymous && !["admin", "pastor"].includes(session.user.role)
        ? "Anônimo"
        : row.authorText ?? "Membro",
  };
}
