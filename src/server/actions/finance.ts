"use server";

import { revalidatePath } from "next/cache";
import { and, eq, isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  financialTransactions,
  monthlyClosings,
  recurringOccurrences,
} from "@/db/schema";
import { requirePermission } from "@/lib/session";
import { transactionSchema } from "@/lib/validations";
import { logAudit } from "@/server/services/audit";
import type { ActionResult } from "./auth";

async function isMonthClosed(year: number, month: number): Promise<boolean> {
  const [closing] = await db
    .select({ id: monthlyClosings.id, reopenedAt: monthlyClosings.reopenedAt })
    .from(monthlyClosings)
    .where(
      and(eq(monthlyClosings.year, year), eq(monthlyClosings.month, month))
    )
    .limit(1);

  return Boolean(closing && !closing.reopenedAt);
}

export async function createTransaction(input: unknown): Promise<ActionResult> {
  const session = await requirePermission("financeiro", "criar");
  const parsed = transactionSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  const [y, m] = parsed.data.transactionDate.split("-").map(Number);
  if (session.user.role !== "admin" && (await isMonthClosed(y, m))) {
    return {
      ok: false,
      error: "Este mês já está fechado. Apenas administradores podem lançar.",
    };
  }

  const { recurringOccurrenceId, ...txValues } = parsed.data;

  const created = await db.transaction(async (tx) => {
    const [inserted] = await tx
      .insert(financialTransactions)
      .values({
        ...txValues,
        memberId: txValues.isAnonymous ? null : txValues.memberId || null,
        visitorNameText: txValues.visitorNameText || null,
        supplierText: txValues.supplierText || null,
        dueDate: txValues.dueDate || null,
        paidAt: txValues.paidAt || null,
        createdBy: session.user.id,
      })
      .returning({ id: financialTransactions.id });

    if (recurringOccurrenceId) {
      await tx
        .update(recurringOccurrences)
        .set({ financialTransactionId: inserted.id })
        .where(
          and(
            eq(recurringOccurrences.id, recurringOccurrenceId),
            isNull(recurringOccurrences.financialTransactionId)
          )
        );
    }

    return inserted;
  });

  await logAudit({
    userId: session.user.id,
    acao: "criacao_lancamento_financeiro",
    entidade: "financial_transaction",
    entidadeId: created.id,
    detalhes: {
      kind: parsed.data.kind,
      amountCents: parsed.data.amountCents,
    },
  });

  revalidatePath("/financeiro");
  revalidatePath("/financeiro/lancamentos");
  revalidatePath("/financeiro/contas");
  revalidatePath("/financeiro/recorrentes");
  revalidatePath("/painel");
  return { ok: true, message: "Lançamento registrado com sucesso." };
}

export async function settleTransaction(id: string): Promise<ActionResult> {
  const session = await requirePermission("financeiro", "editar");

  const [tx] = await db
    .select()
    .from(financialTransactions)
    .where(and(eq(financialTransactions.id, id), isNull(financialTransactions.deletedAt)))
    .limit(1);

  if (!tx) return { ok: false, error: "Lançamento não encontrado." };

  const [y, m] = tx.transactionDate.split("-").map(Number);
  if (session.user.role !== "admin" && (await isMonthClosed(y, m))) {
    return { ok: false, error: "Mês fechado para alterações." };
  }

  const today = new Date().toISOString().slice(0, 10);
  await db
    .update(financialTransactions)
    .set({ paidAt: today, updatedAt: new Date() })
    .where(eq(financialTransactions.id, id));

  await logAudit({
    userId: session.user.id,
    acao: "baixa_conta_financeira",
    entidade: "financial_transaction",
    entidadeId: id,
  });

  revalidatePath("/financeiro");
  revalidatePath("/financeiro/contas");
  return { ok: true, message: "Baixa registrada com sucesso." };
}

export async function closeMonth(
  year: number,
  month: number
): Promise<ActionResult> {
  const session = await requirePermission("financeiro", "editar");

  const monthPrefix = `${year}-${String(month).padStart(2, "0")}`;

  await db.transaction(async (tx) => {
    const rows = await tx
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
      .groupBy(financialTransactions.kind);

    const totalInCents = rows.find((r) => r.kind === "receita")?.totalCents ?? 0;
    const totalOutCents = rows.find((r) => r.kind === "despesa")?.totalCents ?? 0;
    const balanceCents = totalInCents - totalOutCents;

    await tx
      .insert(monthlyClosings)
      .values({
        year,
        month,
        totalInCents,
        totalOutCents,
        balanceCents,
        closedBy: session.user.id,
      })
      .onConflictDoUpdate({
        target: [monthlyClosings.year, monthlyClosings.month],
        set: {
          totalInCents,
          totalOutCents,
          balanceCents,
          closedBy: session.user.id,
          closedAt: new Date(),
          reopenedAt: null,
          reopenedBy: null,
          reopenReason: null,
        },
      });
  });

  await logAudit({
    userId: session.user.id,
    acao: "fechamento_mensal",
    entidade: "monthly_closing",
    detalhes: { year, month },
  });

  revalidatePath("/financeiro/fechamento");
  return { ok: true, message: `Mês ${month}/${year} fechado com sucesso.` };
}

export async function reopenMonth(
  year: number,
  month: number,
  reason: string
): Promise<ActionResult> {
  const session = await requirePermission("financeiro", "excluir");
  if (session.user.role !== "admin") {
    return {
      ok: false,
      error: "Apenas administradores podem reabrir um mês fechado.",
    };
  }
  if (!reason.trim()) {
    return { ok: false, error: "Informe o motivo da reabertura." };
  }

  await db
    .update(monthlyClosings)
    .set({
      reopenedBy: session.user.id,
      reopenedAt: new Date(),
      reopenReason: reason.trim(),
    })
    .where(and(eq(monthlyClosings.year, year), eq(monthlyClosings.month, month)));

  await logAudit({
    userId: session.user.id,
    acao: "reabertura_mensal",
    entidade: "monthly_closing",
    detalhes: { year, month, reason: reason.trim() },
  });

  revalidatePath("/financeiro/fechamento");
  return { ok: true, message: `Mês ${month}/${year} reaberto.` };
}
