import { and, asc, desc, eq, gte, isNotNull, isNull, lte, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  financialCategories,
  financialTransactions,
  members,
  monthlyClosings,
} from "@/db/schema";
import { requirePermission } from "@/lib/session";

export async function getFinancialCategories() {
  await requirePermission("financeiro", "ver");

  return db
    .select()
    .from(financialCategories)
    .where(and(eq(financialCategories.isActive, true), isNull(financialCategories.deletedAt)))
    .orderBy(asc(financialCategories.kind), asc(financialCategories.name));
}

export async function getFinanceDashboard() {
  await requirePermission("financeiro", "ver");

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const monthPrefix = `${year}-${String(month).padStart(2, "0")}`;
  const today = now.toISOString().slice(0, 10);

  const [monthRows, overdueRows, recent] = await Promise.all([
    db
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
      .groupBy(financialTransactions.kind),
    db
      .select({
        totalCents: sql<number>`coalesce(sum(${financialTransactions.amountCents}), 0)::int`,
        count: sql<number>`count(*)::int`,
      })
      .from(financialTransactions)
      .where(
        and(
          isNull(financialTransactions.deletedAt),
          isNull(financialTransactions.paidAt),
          lte(financialTransactions.dueDate, today)
        )
      ),
    db
      .select({
        id: financialTransactions.id,
        kind: financialTransactions.kind,
        description: financialTransactions.description,
        amountCents: financialTransactions.amountCents,
        transactionDate: financialTransactions.transactionDate,
        categoryName: financialCategories.name,
      })
      .from(financialTransactions)
      .innerJoin(
        financialCategories,
        eq(financialTransactions.categoryId, financialCategories.id)
      )
      .where(isNull(financialTransactions.deletedAt))
      .orderBy(desc(financialTransactions.transactionDate), desc(financialTransactions.createdAt))
      .limit(10),
  ]);

  const totalInCents =
    monthRows.find((r) => r.kind === "receita")?.totalCents ?? 0;
  const totalOutCents =
    monthRows.find((r) => r.kind === "despesa")?.totalCents ?? 0;

  return {
    totalInCents,
    totalOutCents,
    balanceCents: totalInCents - totalOutCents,
    overdueCount: overdueRows[0]?.count ?? 0,
    overdueCents: overdueRows[0]?.totalCents ?? 0,
    recent,
  };
}

export async function getTransactions(params: {
  kind?: string;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
} = {}) {
  await requirePermission("financeiro", "ver");

  const conditions = [isNull(financialTransactions.deletedAt)];
  if (params.kind && params.kind !== "all") {
    conditions.push(eq(financialTransactions.kind, params.kind));
  }
  if (params.categoryId && params.categoryId !== "all") {
    conditions.push(eq(financialTransactions.categoryId, params.categoryId));
  }
  if (params.startDate) {
    conditions.push(gte(financialTransactions.transactionDate, params.startDate));
  }
  if (params.endDate) {
    conditions.push(lte(financialTransactions.transactionDate, params.endDate));
  }

  return db
    .select({
      id: financialTransactions.id,
      kind: financialTransactions.kind,
      description: financialTransactions.description,
      amountCents: financialTransactions.amountCents,
      transactionDate: financialTransactions.transactionDate,
      paymentMethod: financialTransactions.paymentMethod,
      isAnonymous: financialTransactions.isAnonymous,
      categoryName: financialCategories.name,
      memberName: members.fullName,
      paidAt: financialTransactions.paidAt,
      dueDate: financialTransactions.dueDate,
    })
    .from(financialTransactions)
    .innerJoin(
      financialCategories,
      eq(financialTransactions.categoryId, financialCategories.id)
    )
    .leftJoin(members, eq(financialTransactions.memberId, members.id))
    .where(and(...conditions))
    .orderBy(desc(financialTransactions.transactionDate), desc(financialTransactions.createdAt))
    .limit(100);
}

export async function getAccountsPayableReceivable() {
  await requirePermission("financeiro", "ver");
  const today = new Date().toISOString().slice(0, 10);

  const rows = await db
    .select({
      id: financialTransactions.id,
      kind: financialTransactions.kind,
      description: financialTransactions.description,
      amountCents: financialTransactions.amountCents,
      dueDate: financialTransactions.dueDate,
      paidAt: financialTransactions.paidAt,
      supplierText: financialTransactions.supplierText,
      categoryName: financialCategories.name,
    })
    .from(financialTransactions)
    .innerJoin(
      financialCategories,
      eq(financialTransactions.categoryId, financialCategories.id)
    )
    .where(
      and(
        isNull(financialTransactions.deletedAt),
        isNotNull(financialTransactions.dueDate)
      )
    )
    .orderBy(asc(financialTransactions.dueDate));

  return {
    upcoming: rows.filter((r) => !r.paidAt && (r.dueDate ?? "") >= today),
    overdue: rows.filter((r) => !r.paidAt && (r.dueDate ?? "") < today),
    settled: rows.filter((r) => Boolean(r.paidAt)),
  };
}

export async function getMonthlyClosings() {
  await requirePermission("financeiro", "ver");

  return db
    .select()
    .from(monthlyClosings)
    .orderBy(desc(monthlyClosings.year), desc(monthlyClosings.month));
}
