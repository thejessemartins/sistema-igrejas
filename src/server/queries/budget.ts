import { and, eq, isNotNull, isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  budgetItems,
  financialCategories,
  financialTransactions,
} from "@/db/schema";
import { requirePermission } from "@/lib/session";

/**
 * Orçamento anual: previsto (budget_items) x realizado (financial_transactions com paidAt preenchido).
 */
export async function getAnnualBudget(year: number) {
  await requirePermission("financeiro", "ver");

  const [categories, plannedRows, realizedRows] = await Promise.all([
    db
      .select()
      .from(financialCategories)
      .where(isNull(financialCategories.deletedAt)),
    db.select().from(budgetItems).where(eq(budgetItems.year, year)),
    db
      .select({
        categoryId: financialTransactions.categoryId,
        kind: financialTransactions.kind,
        totalCents: sql<number>`coalesce(sum(${financialTransactions.amountCents}), 0)::int`,
      })
      .from(financialTransactions)
      .where(
        and(
          isNull(financialTransactions.deletedAt),
          isNotNull(financialTransactions.paidAt),
          sql`EXTRACT(YEAR FROM ${financialTransactions.transactionDate}::date) = ${year}`
        )
      )
      .groupBy(financialTransactions.categoryId, financialTransactions.kind),
  ]);

  return categories.map((cat) => {
    const planned = plannedRows
      .filter((p) => p.categoryId === cat.id)
      .reduce(
        (acc, p) =>
          acc + (cat.kind === "receita" ? p.plannedInCents : p.plannedOutCents),
        0
      );

    const realized =
      realizedRows.find((r) => r.categoryId === cat.id)?.totalCents ?? 0;

    return {
      categoryId: cat.id,
      categoryName: cat.name,
      kind: cat.kind,
      plannedCents: planned,
      realizedCents: realized,
      diffCents: realized - planned,
    };
  });
}
