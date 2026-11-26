import { and, asc, desc, eq, ilike, isNull, or, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  cellMeetingAttendance,
  cellMeetings,
  cellMembers,
  cells,
  members,
} from "@/db/schema";
import { requirePermission, type AppSession } from "@/lib/session";

export function isCellAllowedForSession(
  session: AppSession,
  cell: { leaderMemberId: string; coLeaderMemberId: string | null }
): boolean {
  if (session.user.role !== "lider_celula") return true;
  if (!session.user.memberId) return false;
  return (
    cell.leaderMemberId === session.user.memberId ||
    cell.coLeaderMemberId === session.user.memberId
  );
}

export interface GetCellsParams {
  search?: string;
  status?: "all" | "active" | "inactive";
}

export async function getCells(params: GetCellsParams = {}) {
  const session = await requirePermission("celulas", "ver");

  const conditions = [isNull(cells.deletedAt)];

  if (session.user.role === "lider_celula") {
    if (!session.user.memberId) return [];
    conditions.push(
      or(
        eq(cells.leaderMemberId, session.user.memberId),
        eq(cells.coLeaderMemberId, session.user.memberId)
      )!
    );
  }

  if (params.status === "active") {
    conditions.push(eq(cells.isActive, true));
  } else if (params.status === "inactive") {
    conditions.push(eq(cells.isActive, false));
  }

  if (params.search?.trim()) {
    const term = `%${params.search.trim()}%`;
    conditions.push(
      or(
        ilike(cells.name, term),
        ilike(cells.addressDistrict, term),
        ilike(members.fullName, term)
      )!
    );
  }

  return db
    .select({
      id: cells.id,
      name: cells.name,
      leaderName: members.fullName,
      weekday: cells.weekday,
      meetingTime: cells.meetingTime,
      addressDistrict: cells.addressDistrict,
      isActive: cells.isActive,
      activeMembersCount: sql<number>`count(${cellMembers.id}) filter (where ${cellMembers.leftAt} is null)::int`,
    })
    .from(cells)
    .innerJoin(members, eq(cells.leaderMemberId, members.id))
    .leftJoin(cellMembers, eq(cells.id, cellMembers.cellId))
    .where(and(...conditions))
    .groupBy(cells.id, members.fullName)
    .orderBy(asc(cells.name));
}

export async function getCellById(id: string) {
  const session = await requirePermission("celulas", "ver");

  const [cell] = await db
    .select()
    .from(cells)
    .where(and(eq(cells.id, id), isNull(cells.deletedAt)))
    .limit(1);

  if (!cell) return null;
  if (!isCellAllowedForSession(session, cell)) {
    throw new Error("Acesso negado a esta célula.");
  }

  const [activeMembers, meetings] = await Promise.all([
    db
      .select({
        linkId: cellMembers.id,
        memberId: members.id,
        fullName: members.fullName,
        phone: members.phone,
        joinedAt: cellMembers.joinedAt,
      })
      .from(cellMembers)
      .innerJoin(members, eq(cellMembers.memberId, members.id))
      .where(and(eq(cellMembers.cellId, id), isNull(cellMembers.leftAt)))
      .orderBy(asc(members.fullName)),
    db
      .select({
        id: cellMeetings.id,
        meetingDate: cellMeetings.meetingDate,
        topic: cellMeetings.topic,
        notes: cellMeetings.notes,
        presentCount: sql<number>`count(${cellMeetingAttendance.id}) filter (where ${cellMeetingAttendance.status} = 'presente')::int`,
        totalCount: sql<number>`count(${cellMeetingAttendance.id})::int`,
      })
      .from(cellMeetings)
      .leftJoin(
        cellMeetingAttendance,
        eq(cellMeetings.id, cellMeetingAttendance.cellMeetingId)
      )
      .where(and(eq(cellMeetings.cellId, id), isNull(cellMeetings.deletedAt)))
      .groupBy(cellMeetings.id)
      .orderBy(desc(cellMeetings.meetingDate)),
  ]);

  return { cell, activeMembers, meetings };
}

export async function getCellMeetingAttendance(meetingId: string) {
  await requirePermission("celulas", "ver");

  return db
    .select({
      memberId: cellMeetingAttendance.memberId,
      status: cellMeetingAttendance.status,
    })
    .from(cellMeetingAttendance)
    .where(eq(cellMeetingAttendance.cellMeetingId, meetingId));
}
