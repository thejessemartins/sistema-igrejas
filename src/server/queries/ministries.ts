import { and, asc, desc, eq, isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  events,
  members,
  ministries,
  ministryMembers,
  scheduleAssignments,
  schedules,
} from "@/db/schema";
import { requirePermission } from "@/lib/session";

export async function getMinistries() {
  await requirePermission("ministerios", "ver");

  return db
    .select({
      id: ministries.id,
      name: ministries.name,
      description: ministries.description,
      leaderName: members.fullName,
      isActive: ministries.isActive,
      volunteersCount: sql<number>`count(${ministryMembers.id}) filter (where ${ministryMembers.leftAt} is null)::int`,
    })
    .from(ministries)
    .leftJoin(members, eq(ministries.leaderMemberId, members.id))
    .leftJoin(ministryMembers, eq(ministries.id, ministryMembers.ministryId))
    .where(isNull(ministries.deletedAt))
    .groupBy(ministries.id, members.fullName)
    .orderBy(asc(ministries.name));
}

export async function getMinistryById(id: string) {
  await requirePermission("ministerios", "ver");

  const [ministry] = await db
    .select()
    .from(ministries)
    .where(and(eq(ministries.id, id), isNull(ministries.deletedAt)))
    .limit(1);

  if (!ministry) return null;

  const volunteers = await db
    .select({
      linkId: ministryMembers.id,
      memberId: members.id,
      fullName: members.fullName,
      roleInMinistry: ministryMembers.roleInMinistry,
      joinedAt: ministryMembers.joinedAt,
    })
    .from(ministryMembers)
    .innerJoin(members, eq(ministryMembers.memberId, members.id))
    .where(
      and(eq(ministryMembers.ministryId, id), isNull(ministryMembers.leftAt))
    )
    .orderBy(asc(members.fullName));

  return { ministry, volunteers };
}

export async function getSchedules() {
  await requirePermission("escalas", "ver");

  return db
    .select({
      id: schedules.id,
      title: schedules.title,
      eventTitle: events.title,
      eventStartsAt: events.startsAt,
      ministryName: ministries.name,
    })
    .from(schedules)
    .innerJoin(events, eq(schedules.eventId, events.id))
    .innerJoin(ministries, eq(schedules.ministryId, ministries.id))
    .where(isNull(schedules.deletedAt))
    .orderBy(desc(events.startsAt));
}

export async function getScheduleById(id: string) {
  await requirePermission("escalas", "ver");

  const [schedule] = await db
    .select({
      id: schedules.id,
      title: schedules.title,
      notes: schedules.notes,
      eventId: schedules.eventId,
      eventTitle: events.title,
      eventStartsAt: events.startsAt,
      ministryId: schedules.ministryId,
      ministryName: ministries.name,
    })
    .from(schedules)
    .innerJoin(events, eq(schedules.eventId, events.id))
    .innerJoin(ministries, eq(schedules.ministryId, ministries.id))
    .where(and(eq(schedules.id, id), isNull(schedules.deletedAt)))
    .limit(1);

  if (!schedule) return null;

  const assignments = await db
    .select({
      id: scheduleAssignments.id,
      memberId: members.id,
      memberName: members.fullName,
      assignmentRole: scheduleAssignments.assignmentRole,
      status: scheduleAssignments.status,
      replacedByMemberId: scheduleAssignments.replacedByMemberId,
    })
    .from(scheduleAssignments)
    .innerJoin(members, eq(scheduleAssignments.memberId, members.id))
    .where(eq(scheduleAssignments.scheduleId, id))
    .orderBy(asc(members.fullName));

  return { schedule, assignments };
}

export async function getMySchedules(memberId: string | null) {
  await requirePermission("escalas", "ver");
  if (!memberId) return [];

  return db
    .select({
      assignmentId: scheduleAssignments.id,
      scheduleId: schedules.id,
      scheduleTitle: schedules.title,
      eventTitle: events.title,
      eventStartsAt: events.startsAt,
      ministryName: ministries.name,
      assignmentRole: scheduleAssignments.assignmentRole,
      status: scheduleAssignments.status,
    })
    .from(scheduleAssignments)
    .innerJoin(schedules, eq(scheduleAssignments.scheduleId, schedules.id))
    .innerJoin(events, eq(schedules.eventId, events.id))
    .innerJoin(ministries, eq(schedules.ministryId, ministries.id))
    .where(eq(scheduleAssignments.memberId, memberId))
    .orderBy(desc(events.startsAt));
}
