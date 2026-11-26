import { and, asc, desc, eq, gte, isNull, lte } from "drizzle-orm";
import { db } from "@/db";
import { events, members, visitors, visitorVisits } from "@/db/schema";
import { requirePermission } from "@/lib/session";

export interface GetEventsParams {
  eventType?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export async function getEvents(params: GetEventsParams = {}) {
  await requirePermission("cultos", "ver");

  const conditions = [isNull(events.deletedAt)];

  if (params.eventType && params.eventType !== "all") {
    conditions.push(eq(events.eventType, params.eventType));
  }

  if (params.status && params.status !== "all") {
    conditions.push(eq(events.status, params.status));
  }

  if (params.startDate) {
    conditions.push(gte(events.startsAt, new Date(params.startDate)));
  }

  if (params.endDate) {
    const end = new Date(params.endDate);
    end.setHours(23, 59, 59, 999);
    conditions.push(lte(events.startsAt, end));
  }

  return db
    .select({
      id: events.id,
      title: events.title,
      eventType: events.eventType,
      startsAt: events.startsAt,
      endsAt: events.endsAt,
      location: events.location,
      theme: events.theme,
      status: events.status,
    })
    .from(events)
    .where(and(...conditions))
    .orderBy(asc(events.startsAt));
}

export async function getEventById(id: string) {
  await requirePermission("cultos", "ver");

  const [event] = await db
    .select({
      id: events.id,
      title: events.title,
      eventType: events.eventType,
      startsAt: events.startsAt,
      endsAt: events.endsAt,
      location: events.location,
      theme: events.theme,
      preacherText: events.preacherText,
      preacherMemberId: events.preacherMemberId,
      preacherMemberName: members.fullName,
      description: events.description,
      status: events.status,
      cancelReason: events.cancelReason,
    })
    .from(events)
    .leftJoin(members, eq(events.preacherMemberId, members.id))
    .where(and(eq(events.id, id), isNull(events.deletedAt)))
    .limit(1);

  if (!event) return null;

  const linkedVisits = await db
    .select({
      visitId: visitorVisits.id,
      visitorId: visitors.id,
      visitorName: visitors.fullName,
      visitedAt: visitorVisits.visitedAt,
      notes: visitorVisits.notes,
    })
    .from(visitorVisits)
    .innerJoin(visitors, eq(visitorVisits.visitorId, visitors.id))
    .where(eq(visitorVisits.eventId, id))
    .orderBy(desc(visitorVisits.visitedAt));

  return { event, linkedVisits };
}
