import { and, count, desc, eq, gte, isNull, lte, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  attendances,
  events,
  financialTransactions,
  members,
  visitors,
} from "@/db/schema";
import { hasPermission } from "@/lib/permissions";
import type { AppSession } from "@/lib/session";

export async function getDashboardStats(session: AppSession) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthPrefix = now.toISOString().slice(0, 7);
  const today = now.toISOString().slice(0, 10);

  const canFinance = hasPermission(session, "financeiro", "ver");

  const [
    [{ activeMembers }],
    [{ monthVisitors }],
    [lastEvent],
    financeRows,
    [{ overdueCount }],
  ] = await Promise.all([
    db
      .select({ activeMembers: count() })
      .from(members)
      .where(and(eq(members.status, "ativo"), isNull(members.deletedAt))),
    db
      .select({ monthVisitors: count() })
      .from(visitors)
      .where(
        and(isNull(visitors.deletedAt), gte(visitors.firstVisitAt, monthStart))
      ),
    db
      .select({ id: events.id, title: events.title, startsAt: events.startsAt })
      .from(events)
      .where(and(eq(events.status, "realizado"), isNull(events.deletedAt)))
      .orderBy(desc(events.startsAt))
      .limit(1),
    canFinance
      ? db
          .select({
            kind: financialTransactions.kind,
            totalCents: sql<number>`coalesce(sum(${financialTransactions.amountCents}), 0)::int`,
          })
          .from(financialTransactions)
          .where(
            and(
              isNull(financialTransactions.deletedAt),
              sql`to_char(${financialTransactions.transactionDate}::date, 'YYYY-MM') = ${monthPrefix}`
            )
          )
          .groupBy(financialTransactions.kind)
      : Promise.resolve([]),
    canFinance
      ? db
          .select({ overdueCount: count() })
          .from(financialTransactions)
          .where(
            and(
              isNull(financialTransactions.deletedAt),
              isNull(financialTransactions.paidAt),
              lte(financialTransactions.dueDate, today)
            )
          )
      : Promise.resolve([{ overdueCount: 0 }]),
  ]);

  let lastEventPresent = 0;
  if (lastEvent) {
    const [{ total }] = await db
      .select({ total: count() })
      .from(attendances)
      .where(
        and(
          eq(attendances.eventId, lastEvent.id),
          eq(attendances.status, "presente")
        )
      );
    lastEventPresent = total;
  }

  const totalInCents =
    financeRows.find((r) => r.kind === "receita")?.totalCents ?? 0;
  const totalOutCents =
    financeRows.find((r) => r.kind === "despesa")?.totalCents ?? 0;

  return {
    activeMembers,
    monthVisitors,
    lastEventTitle: lastEvent?.title ?? null,
    lastEventPresent,
    canFinance,
    totalInCents,
    totalOutCents,
    balanceCents: totalInCents - totalOutCents,
    overdueCount,
  };
}
