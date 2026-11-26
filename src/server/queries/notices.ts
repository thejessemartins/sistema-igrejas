import { and, desc, eq, gte, isNull, lte, or } from "drizzle-orm";
import { db } from "@/db";
import {
  cellMembers,
  events,
  ministryMembers,
  noticeReads,
  notices,
  user,
} from "@/db/schema";
import { requirePermission, type AppSession } from "@/lib/session";

async function getUserScopeIds(memberId: string | null) {
  if (!memberId) return { cellIds: [] as string[], ministryIds: [] as string[] };

  const [cRows, mRows] = await Promise.all([
    db
      .select({ cellId: cellMembers.cellId })
      .from(cellMembers)
      .where(
        and(eq(cellMembers.memberId, memberId), isNull(cellMembers.leftAt))
      ),
    db
      .select({ ministryId: ministryMembers.ministryId })
      .from(ministryMembers)
      .where(
        and(
          eq(ministryMembers.memberId, memberId),
          isNull(ministryMembers.leftAt)
        )
      ),
  ]);

  return {
    cellIds: cRows.map((r) => r.cellId),
    ministryIds: mRows.map((r) => r.ministryId),
  };
}

export async function getNoticesForUser(session: AppSession) {
  await requirePermission("avisos", "ver");
  const now = new Date();
  const { cellIds, ministryIds } = await getUserScopeIds(session.user.memberId);

  const rows = await db
    .select({
      id: notices.id,
      title: notices.title,
      body: notices.body,
      audienceType: notices.audienceType,
      cellId: notices.cellId,
      ministryId: notices.ministryId,
      priority: notices.priority,
      publishAt: notices.publishAt,
      expiresAt: notices.expiresAt,
      isPinned: notices.isPinned,
      authorName: user.name,
      readAt: noticeReads.readAt,
    })
    .from(notices)
    .leftJoin(user, eq(notices.authorUserId, user.id))
    .leftJoin(
      noticeReads,
      and(
        eq(noticeReads.noticeId, notices.id),
        eq(noticeReads.userId, session.user.id)
      )
    )
    .where(
      and(
        isNull(notices.deletedAt),
        lte(notices.publishAt, now),
        or(isNull(notices.expiresAt), gte(notices.expiresAt, now))
      )
    )
    .orderBy(desc(notices.isPinned), desc(notices.publishAt));

  return rows.filter((n) => {
    if (
      session.user.role === "admin" ||
      session.user.role === "pastor" ||
      session.user.role === "secretario"
    ) {
      return true;
    }
    if (n.audienceType === "todos" || n.audienceType === "papeis") return true;
    if (n.audienceType === "celula" && n.cellId) {
      return cellIds.includes(n.cellId);
    }
    if (n.audienceType === "ministerio" && n.ministryId) {
      return ministryIds.includes(n.ministryId);
    }
    return false;
  });
}

export async function getNoticeById(id: string, session: AppSession) {
  await requirePermission("avisos", "ver");

  const [notice] = await db
    .select({
      id: notices.id,
      title: notices.title,
      body: notices.body,
      audienceType: notices.audienceType,
      cellId: notices.cellId,
      ministryId: notices.ministryId,
      priority: notices.priority,
      publishAt: notices.publishAt,
      expiresAt: notices.expiresAt,
      isPinned: notices.isPinned,
      authorUserId: notices.authorUserId,
      authorName: user.name,
    })
    .from(notices)
    .leftJoin(user, eq(notices.authorUserId, user.id))
    .where(and(eq(notices.id, id), isNull(notices.deletedAt)))
    .limit(1);

  if (!notice) return null;

  const canManage =
    session.user.role === "admin" ||
    session.user.role === "pastor" ||
    session.user.role === "secretario" ||
    notice.authorUserId === session.user.id;

  if (!canManage) {
    const { cellIds, ministryIds } = await getUserScopeIds(
      session.user.memberId
    );
    const allowed =
      notice.audienceType === "todos" ||
      notice.audienceType === "papeis" ||
      (notice.audienceType === "celula" &&
        notice.cellId &&
        cellIds.includes(notice.cellId)) ||
      (notice.audienceType === "ministerio" &&
        notice.ministryId &&
        ministryIds.includes(notice.ministryId));

    if (!allowed) {
      throw new Error("Acesso negado a este aviso.");
    }
  }

  const reads = canManage
    ? await db
        .select({
          userId: user.id,
          userName: user.name,
          readAt: noticeReads.readAt,
        })
        .from(noticeReads)
        .innerJoin(user, eq(noticeReads.userId, user.id))
        .where(eq(noticeReads.noticeId, id))
        .orderBy(desc(noticeReads.readAt))
    : [];

  return { notice, reads, canManage };
}

export async function getMuralBlocks() {
  const now = new Date();
  const upcomingEvents = await db
    .select({
      id: events.id,
      title: events.title,
      startsAt: events.startsAt,
    })
    .from(events)
    .where(
      and(
        isNull(events.deletedAt),
        eq(events.status, "agendado"),
        gte(events.startsAt, now)
      )
    )
    .orderBy(events.startsAt)
    .limit(5);

  return { upcomingEvents };
}
