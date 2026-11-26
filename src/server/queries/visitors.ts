import { and, desc, eq, gte, ilike, isNull, lte, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { members, visitors, visitorVisits } from "@/db/schema";
import { requirePermission } from "@/lib/session";

export interface GetVisitorsParams {
  search?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export async function getVisitors(params: GetVisitorsParams = {}) {
  await requirePermission("visitantes", "ver");

  const conditions = [isNull(visitors.deletedAt)];

  if (params.search?.trim()) {
    const term = `%${params.search.trim()}%`;
    conditions.push(
      or(ilike(visitors.fullName, term), ilike(visitors.phone, term))!
    );
  }

  if (params.status && params.status !== "all") {
    conditions.push(eq(visitors.followUpStatus, params.status));
  }

  if (params.startDate) {
    conditions.push(gte(visitors.firstVisitAt, new Date(params.startDate)));
  }

  if (params.endDate) {
    const end = new Date(params.endDate);
    end.setHours(23, 59, 59, 999);
    conditions.push(lte(visitors.firstVisitAt, end));
  }

  return db
    .select({
      id: visitors.id,
      fullName: visitors.fullName,
      phone: visitors.phone,
      email: visitors.email,
      followUpStatus: visitors.followUpStatus,
      firstVisitAt: visitors.firstVisitAt,
      convertedMemberId: visitors.convertedMemberId,
      visitCount: sql<number>`count(${visitorVisits.id})::int`,
      lastVisitAt: sql<Date | null>`max(${visitorVisits.visitedAt})`,
    })
    .from(visitors)
    .leftJoin(visitorVisits, eq(visitors.id, visitorVisits.visitorId))
    .where(and(...conditions))
    .groupBy(visitors.id)
    .orderBy(desc(visitors.firstVisitAt));
}

export async function getVisitorById(id: string) {
  await requirePermission("visitantes", "ver");

  const [visitor] = await db
    .select({
      id: visitors.id,
      fullName: visitors.fullName,
      phone: visitors.phone,
      email: visitors.email,
      invitedByMemberId: visitors.invitedByMemberId,
      invitedByMemberName: members.fullName,
      invitedByText: visitors.invitedByText,
      firstVisitAt: visitors.firstVisitAt,
      followUpStatus: visitors.followUpStatus,
      notes: visitors.notes,
      convertedMemberId: visitors.convertedMemberId,
      createdAt: visitors.createdAt,
    })
    .from(visitors)
    .leftJoin(members, eq(visitors.invitedByMemberId, members.id))
    .where(and(eq(visitors.id, id), isNull(visitors.deletedAt)))
    .limit(1);

  if (!visitor) return null;

  const visits = await db
    .select()
    .from(visitorVisits)
    .where(eq(visitorVisits.visitorId, id))
    .orderBy(desc(visitorVisits.visitedAt));

  return { visitor, visits };
}
