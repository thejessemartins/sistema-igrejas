"use server";

import { revalidatePath } from "next/cache";
import { and, eq, isNull, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import {
  financialCategories,
  financialTransactions,
  storeProducts,
  storeSaleItems,
  storeSales,
} from "@/db/schema";
import { requireSession } from "@/lib/session";
import { logAudit } from "@/server/services/audit";
import type { ActionResult } from "./auth";

const productSchema = z.object({
  name: z.string().trim().min(2, "Nome é obrigatório").max(120),
  description: z.string().trim().max(500).optional().nullable(),
  priceCents: z.coerce.number().int().positive("Preço deve ser maior que zero"),
  stockQuantity: z.coerce
    .number()
    .int()
    .min(0, "Estoque não pode ser negativo"),
});

const saleSchema = z.object({
  paymentMethod: z.enum(["dinheiro", "transferencia_manual", "cartao_manual"]),
  buyerMemberId: z.string().uuid().optional().nullable(),
  buyerText: z.string().trim().max(120).optional().nullable(),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.coerce.number().int().positive(),
      })
    )
    .min(1, "Adicione ao menos um item ao carrinho"),
});

export async function createStoreProduct(input: unknown): Promise<ActionResult> {
  const session = await requireSession();
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  const [created] = await db
    .insert(storeProducts)
    .values({
      name: parsed.data.name,
      description: parsed.data.description || null,
      priceCents: parsed.data.priceCents,
      stockQuantity: parsed.data.stockQuantity,
      isActive: true,
    })
    .returning({ id: storeProducts.id });

  await logAudit({
    userId: session.user.id,
    acao: "criacao_produto_loja",
    entidade: "store_product",
    entidadeId: created.id,
    detalhes: { name: parsed.data.name, priceCents: parsed.data.priceCents },
  });

  revalidatePath("/loja/produtos");
  revalidatePath("/loja/vender");
  return { ok: true, message: "Produto cadastrado com sucesso." };
}

export async function updateStoreProductStock(
  id: string,
  stockQuantity: number
): Promise<ActionResult> {
  await requireSession();
  if (!Number.isInteger(stockQuantity) || stockQuantity < 0) {
    return { ok: false, error: "Estoque não pode ser negativo." };
  }

  await db
    .update(storeProducts)
    .set({ stockQuantity, updatedAt: new Date() })
    .where(and(eq(storeProducts.id, id), isNull(storeProducts.deletedAt)));

  revalidatePath("/loja/produtos");
  revalidatePath("/loja/vender");
  return { ok: true, message: "Estoque atualizado." };
}

export async function toggleStoreProductActive(
  id: string,
  isActive: boolean
): Promise<ActionResult> {
  await requireSession();
  await db
    .update(storeProducts)
    .set({ isActive, updatedAt: new Date() })
    .where(and(eq(storeProducts.id, id), isNull(storeProducts.deletedAt)));

  revalidatePath("/loja/produtos");
  revalidatePath("/loja/vender");
  return { ok: true, message: isActive ? "Produto ativado." : "Produto desativado." };
}

export async function createStoreSale(input: unknown): Promise<ActionResult> {
  const session = await requireSession();
  const parsed = saleSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  try {
    const saleId = await db.transaction(async (tx) => {
      let totalCents = 0;
      const resolvedItems: Array<{
        productId: string;
        productNameSnapshot: string;
        unitPriceCentsSnapshot: number;
        quantity: number;
      }> = [];

      for (const item of parsed.data.items) {
        const [product] = await tx
          .select()
          .from(storeProducts)
          .where(
            and(
              eq(storeProducts.id, item.productId),
              isNull(storeProducts.deletedAt)
            )
          )
          .limit(1);

        if (!product || !product.isActive) {
          throw new Error("Produto indisponível para venda.");
        }
        if (product.stockQuantity < item.quantity) {
          throw new Error(
            `Estoque insuficiente para "${product.name}" (disponível: ${product.stockQuantity}).`
          );
        }

        await tx
          .update(storeProducts)
          .set({
            stockQuantity: sql`${storeProducts.stockQuantity} - ${item.quantity}`,
            updatedAt: new Date(),
          })
          .where(eq(storeProducts.id, product.id));

        totalCents += product.priceCents * item.quantity;
        resolvedItems.push({
          productId: product.id,
          productNameSnapshot: product.name,
          unitPriceCentsSnapshot: product.priceCents,
          quantity: item.quantity,
        });
      }

      let [category] = await tx
        .select({ id: financialCategories.id })
        .from(financialCategories)
        .where(
          and(
            eq(financialCategories.name, "Cantina/Eventos"),
            eq(financialCategories.kind, "receita"),
            isNull(financialCategories.deletedAt)
          )
        )
        .limit(1);

      if (!category) {
        [category] = await tx
          .insert(financialCategories)
          .values({
            name: "Cantina/Eventos",
            kind: "receita",
            isActive: true,
          })
          .returning({ id: financialCategories.id });
      }

      const today = new Date().toISOString().slice(0, 10);
      const [finTx] = await tx
        .insert(financialTransactions)
        .values({
          kind: "receita",
          categoryId: category.id,
          memberId: parsed.data.buyerMemberId || null,
          isAnonymous: !parsed.data.buyerMemberId,
          visitorNameText: parsed.data.buyerText || null,
          description: `Venda Loja/Cantina (${resolvedItems.length} item(ns))`,
          amountCents: totalCents,
          transactionDate: today,
          paymentMethod: parsed.data.paymentMethod,
          paidAt: today,
          createdBy: session.user.id,
        })
        .returning({ id: financialTransactions.id });

      const [sale] = await tx
        .insert(storeSales)
        .values({
          sellerUserId: session.user.id,
          buyerMemberId: parsed.data.buyerMemberId || null,
          buyerText: parsed.data.buyerText || null,
          paymentMethod: parsed.data.paymentMethod,
          totalCents,
          financialTransactionId: finTx.id,
          status: "concluida",
        })
        .returning({ id: storeSales.id });

      await tx.insert(storeSaleItems).values(
        resolvedItems.map((ri) => ({
          saleId: sale.id,
          ...ri,
        }))
      );

      return sale.id;
    });

    await logAudit({
      userId: session.user.id,
      acao: "venda_loja",
      entidade: "store_sale",
      entidadeId: saleId,
      detalhes: { paymentMethod: parsed.data.paymentMethod },
    });

    revalidatePath("/loja/produtos");
    revalidatePath("/loja/vender");
    revalidatePath("/loja/vendas");
    revalidatePath("/financeiro");
    revalidatePath("/financeiro/lancamentos");
    return { ok: true, message: "Venda concluída e lançada no financeiro." };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Erro ao concluir venda.",
    };
  }
}

export async function cancelStoreSale(saleId: string): Promise<ActionResult> {
  const session = await requireSession();

  try {
    await db.transaction(async (tx) => {
      const [sale] = await tx
        .select()
        .from(storeSales)
        .where(eq(storeSales.id, saleId))
        .limit(1);

      if (!sale) throw new Error("Venda não encontrada.");
      if (sale.status === "cancelada") {
        throw new Error("Esta venda já foi cancelada.");
      }

      const items = await tx
        .select()
        .from(storeSaleItems)
        .where(eq(storeSaleItems.saleId, sale.id));

      for (const item of items) {
        await tx
          .update(storeProducts)
          .set({
            stockQuantity: sql`${storeProducts.stockQuantity} + ${item.quantity}`,
            updatedAt: new Date(),
          })
          .where(eq(storeProducts.id, item.productId));
      }

      if (sale.financialTransactionId) {
        const [origTx] = await tx
          .select()
          .from(financialTransactions)
          .where(eq(financialTransactions.id, sale.financialTransactionId))
          .limit(1);

        if (origTx) {
          const today = new Date().toISOString().slice(0, 10);
          await tx.insert(financialTransactions).values({
            kind: "despesa",
            categoryId: origTx.categoryId,
            description: `Estorno: ${origTx.description}`,
            amountCents: sale.totalCents,
            transactionDate: today,
            paymentMethod: origTx.paymentMethod,
            paidAt: today,
            reversedOfId: origTx.id,
            createdBy: session.user.id,
          });
        }
      }

      await tx
        .update(storeSales)
        .set({ status: "cancelada" })
        .where(eq(storeSales.id, sale.id));
    });

    await logAudit({
      userId: session.user.id,
      acao: "cancelamento_venda_loja",
      entidade: "store_sale",
      entidadeId: saleId,
      detalhes: {},
    });

    revalidatePath("/loja/produtos");
    revalidatePath("/loja/vender");
    revalidatePath("/loja/vendas");
    revalidatePath("/financeiro");
    revalidatePath("/financeiro/lancamentos");
    return {
      ok: true,
      message: "Venda cancelada, estoque devolvido e estorno lançado.",
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Erro ao cancelar venda.",
    };
  }
}
