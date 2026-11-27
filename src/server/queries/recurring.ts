import { and, asc, desc, eq, gte, isNull, lte } from "drizzle-orm";
import { db } from "@/db";
import {
  financialCategories,
  members,
  recurringCommitments,
  recurringOccurrences,
} from "@/db/schema";

export async function getRecurringDashboardData() {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  const monthStart = `${y}-${String(m).padStart(2, "0")}-01`;
  const lastDay = new Date(y, m, 0).getDate();
  const monthEnd = `${y}-${String(m).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  const [commitments, monthOccurrences] = await Promise.all([
    db
      .select({
        id: recurringCommitments.id,
        memberId: recurringCommitments.memberId,
        memberName: members.fullName,
        categoryId: recurringCommitments.categoryId,
        categoryName: financialCategories.name,
        amountCents: recurringCommitments.amountCents,
        frequency: recurringCommitments.frequency,
        dayOfMonth: recurringCommitments.dayOfMonth,
        startsAt: recurringCommitments.startsAt,
        endsAt: recurringCommitments.endsAt,
        status: recurringCommitments.status,
        notes: recurringCommitments.notes,
        createdAt: recurringCommitments.createdAt,
      })
      .from(recurringCommitments)
      .innerJoin(members, eq(recurringCommitments.memberId, members.id))
      .innerJoin(
        financialCategories,
        eq(recurringCommitments.categoryId, financialCategories.id)
      )
      .where(isNull(recurringCommitments.deletedAt))
      .orderBy(desc(recurringCommitments.createdAt)),

    db
      .select({
        id: recurringOccurrences.id,
        commitmentId: recurringOccurrences.commitmentId,
        dueDate: recurringOccurrences.dueDate,
        financialTransactionId: recurringOccurrences.financialTransactionId,
        memberId: recurringCommitments.memberId,
        memberName: members.fullName,
        categoryId: recurringCommitments.categoryId,
        categoryName: financialCategories.name,
        amountCents: recurringCommitments.amountCents,
        commitmentStatus: recurringCommitments.status,
      })
      .from(recurringOccurrences)
      .innerJoin(
        recurringCommitments,
        eq(recurringOccurrences.commitmentId, recurringCommitments.id)
      )
      .innerJoin(members, eq(recurringCommitments.memberId, members.id))
      .innerJoin(
        financialCategories,
        eq(recurringCommitments.categoryId, financialCategories.id)
      )
      .where(
        and(
          isNull(recurringCommitments.deletedAt),
          gte(recurringOccurrences.dueDate, monthStart),
          lte(recurringOccurrences.dueDate, monthEnd)
        )
      )
      .orderBy(asc(recurringOccurrences.dueDate)),
  ]);

  const expectedMonthCents = monthOccurrences
    .filter((o) => o.commitmentStatus === "ativo")
    .reduce((acc, o) => acc + o.amountCents, 0);

  const confirmedMonthCents = monthOccurrences
    .filter((o) => o.financialTransactionId !== null)
    .reduce((acc, o) => acc + o.amountCents, 0);

  return {
    commitments,
    monthOccurrences,
    expectedMonthCents,
    confirmedMonthCents,
  };
}

export async function getMyRecurringCommitments(memberId: string | null) {
  if (!memberId) return [];

  const rows = await db
    .select({
      id: recurringCommitments.id,
      categoryName: financialCategories.name,
      amountCents: recurringCommitments.amountCents,
      frequency: recurringCommitments.frequency,
      dayOfMonth: recurringCommitments.dayOfMonth,
      startsAt: recurringCommitments.startsAt,
      status: recurringCommitments.status,
    })
    .from(recurringCommitments)
    .innerJoin(
      financialCategories,
      eq(recurringCommitments.categoryId, financialCategories.id)
    )
    .where(
      and(
        eq(recurringCommitments.memberId, memberId),
        isNull(recurringCommitments.deletedAt)
      )
    )
    .orderBy(desc(recurringCommitments.createdAt));

  return rows;
}

export async function getRecurringOccurrenceForPrefill(occurrenceId: string) {
  const [row] = await db
    .select({
      id: recurringOccurrences.id,
      dueDate: recurringOccurrences.dueDate,
      financialTransactionId: recurringOccurrences.financialTransactionId,
      memberId: recurringCommitments.memberId,
      memberName: members.fullName,
      categoryId: recurringCommitments.categoryId,
      amountCents: recurringCommitments.amountCents,
    })
    .from(recurringOccurrences)
    .innerJoin(
      recurringCommitments,
      eq(recurringOccurrences.commitmentId, recurringCommitments.id)
    )
    .innerJoin(members, eq(recurringCommitments.memberId, members.id))
    .where(eq(recurringOccurrences.id, occurrenceId))
    .limit(1);

  if (!row || row.financialTransactionId) return null;
  return row;
}
