"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { budgetItems } from "@/db/schema";
import { requirePermission } from "@/lib/session";
import { logAudit } from "@/server/services/audit";
import type { ActionResult } from "./auth";

export async function saveBudgetItem(input: {
  year: number;
  month: number;
  categoryId: string;
  plannedInCents: number;
  plannedOutCents: number;
}): Promise<ActionResult> {
  const session = await requirePermission("financeiro", "editar");

  await db
    .insert(budgetItems)
    .values({
      year: input.year,
      month: input.month,
      categoryId: input.categoryId,
      plannedInCents: input.plannedInCents,
      plannedOutCents: input.plannedOutCents,
    })
    .onConflictDoUpdate({
      target: [budgetItems.year, budgetItems.month, budgetItems.categoryId],
      set: {
        plannedInCents: input.plannedInCents,
        plannedOutCents: input.plannedOutCents,
        updatedAt: new Date(),
      },
    });

  await logAudit({
    userId: session.user.id,
    acao: "edicao_orcamento",
    entidade: "budget_item",
    detalhes: { year: input.year, month: input.month },
  });

  revalidatePath("/financeiro/orcamento");
  return { ok: true, message: "Orçamento salvo." };
}
