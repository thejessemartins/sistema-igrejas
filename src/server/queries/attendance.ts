import { and, asc, desc, eq, gte, isNull, lte, ne } from "drizzle-orm";
import { db } from "@/db";
import { attendances, events, members, visitors } from "@/db/schema";
import { requirePermission } from "@/lib/session";

/**
 * Fórmula oficial de frequência:
 * frequencia (%) = presenças / (presenças + ausências) * 100
 * Justificados são ignorados no denominador.
 */
export function calculateAttendanceRate(
  presentCount: number,
  absentCount: number
): number | null {
  const denom = presentCount + absentCount;
  if (denom === 0) return null;
  return Math.round((presentCount / denom) * 100);
}

export async function getAttendanceEvents() {
  await requirePermission("presenca", "ver");

  return db
    .select({
      id: events.id,
      title: events.title,
      eventType: events.eventType,
      startsAt: events.startsAt,
      status: events.status,
    })
    .from(events)
    .where(and(isNull(events.deletedAt), ne(events.status, "cancelado")))
    .orderBy(desc(events.startsAt))
    .limit(50);
}

export async function getEventAttendanceSheet(eventId: string) {
  await requirePermission("presenca", "ver");

  const [event] = await db
    .select()
    .from(events)
    .where(and(eq(events.id, eventId), isNull(events.deletedAt)))
    .limit(1);

  if (!event) return null;

  const [activeMembers, activeVisitors, saved] = await Promise.all([
    db
      .select({ id: members.id, fullName: members.fullName })
      .from(members)
      .where(and(eq(members.status, "ativo"), isNull(members.deletedAt)))
      .orderBy(asc(members.fullName)),
    db
      .select({ id: visitors.id, fullName: visitors.fullName })
      .from(visitors)
      .where(isNull(visitors.deletedAt))
      .orderBy(asc(visitors.fullName))
      .limit(50),
    db
      .select({
        memberId: attendances.memberId,
        visitorId: attendances.visitorId,
        status: attendances.status,
      })
      .from(attendances)
      .where(eq(attendances.eventId, eventId)),
  ]);

  return { event, activeMembers, activeVisitors, saved };
}

export async function getMemberAttendanceHistory(memberId: string) {
  await requirePermission("presenca", "ver");

  const [member] = await db
    .select({ id: members.id, fullName: members.fullName })
    .from(members)
    .where(eq(members.id, memberId))
    .limit(1);

  if (!member) return null;

  const rows = await db
    .select({
      id: attendances.id,
      status: attendances.status,
      eventId: events.id,
      eventTitle: events.title,
      startsAt: events.startsAt,
    })
    .from(attendances)
    .innerJoin(events, eq(attendances.eventId, events.id))
    .where(eq(attendances.memberId, memberId))
    .orderBy(desc(events.startsAt))
    .limit(50);

  const presentCount = rows.filter((r) => r.status === "presente").length;
  const absentCount = rows.filter((r) => r.status === "ausente").length;
  const rate = calculateAttendanceRate(presentCount, absentCount);

  return { member, rows, presentCount, absentCount, rate };
}

export async function getAttendanceReport(params: {
  startDate?: string;
  endDate?: string;
}) {
  await requirePermission("presenca", "ver");

  const conditions = [isNull(events.deletedAt), ne(events.status, "cancelado")];
  if (params.startDate) {
    conditions.push(gte(events.startsAt, new Date(params.startDate)));
  }
  if (params.endDate) {
    const end = new Date(params.endDate);
    end.setHours(23, 59, 59, 999);
    conditions.push(lte(events.startsAt, end));
  }

  const rows = await db
    .select({
      memberId: attendances.memberId,
      personName: attendances.personNameSnapshot,
      status: attendances.status,
      startsAt: events.startsAt,
    })
    .from(attendances)
    .innerJoin(events, eq(attendances.eventId, events.id))
    .where(and(...conditions))
    .orderBy(desc(events.startsAt));

  const byMember = new Map<
    string,
    { name: string; present: number; absent: number; statuses: string[] }
  >();

  for (const r of rows) {
    if (!r.memberId) continue;
    const entry = byMember.get(r.memberId) ?? {
      name: r.personName,
      present: 0,
      absent: 0,
      statuses: [],
    };
    if (r.status === "presente") entry.present += 1;
    if (r.status === "ausente") entry.absent += 1;
    entry.statuses.push(r.status);
    byMember.set(r.memberId, entry);
  }

  const summary = Array.from(byMember.entries()).map(([memberId, v]) => {
    const rate = calculateAttendanceRate(v.present, v.absent);
    const totalConsidered = v.present + v.absent;
    const threeConsecutiveAbsences =
      v.statuses.slice(0, 3).length === 3 &&
      v.statuses.slice(0, 3).every((s) => s === "ausente");
    const lowFrequency =
      (totalConsidered >= 4 && rate !== null && rate < 50) ||
      threeConsecutiveAbsences;

    return {
      memberId,
      name: v.name,
      present: v.present,
      absent: v.absent,
      rate,
      lowFrequency,
      threeConsecutiveAbsences,
    };
  });

  return summary;
}
