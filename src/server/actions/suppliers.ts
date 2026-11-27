"use server";

import { revalidatePath } from "next/cache";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { supplierContracts, suppliers } from "@/db/schema";
import { requirePermission } from "@/lib/session";
import { logAudit } from "@/server/services/audit";
import type { ActionResult } from "./auth";

const supplierSchema = z.object({
  name: z.string().trim().min(2, "Nome é obrigatório"),
  documentText: z.string().trim().optional().nullable(),
  contactName: z.string().trim().optional().nullable(),
  phone: z.string().trim().optional().nullable(),
  email: z.string().trim().optional().nullable(),
  categoryText: z.string().trim().optional().nullable(),
  addressText: z.string().trim().optional().nullable(),
  notes: z.string().trim().optional().nullable(),
});

const contractSchema = z.object({
  supplierId: z.string().uuid("Fornecedor inválido"),
  title: z.string().trim().min(2, "Título é obrigatório"),
  startsAt: z.string().min(1, "Data de início obrigatória"),
  endsAt: z.string().optional().nullable(),
  monthlyValueCents: z.coerce.number().int().min(0).optional().nullable(),
  renewalAlertDays: z.coerce.number().int().min(1).default(30),
});

export async function createSupplier(input: unknown): Promise<ActionResult> {
  const session = await requirePermission("financeiro", "criar");
  const parsed = supplierSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  const [created] = await db
    .insert(suppliers)
    .values({
      ...parsed.data,
      documentText: parsed.data.documentText?.replace(/\D/g, "") || null,
    })
    .returning({ id: suppliers.id });

  await logAudit({
    userId: session.user.id,
    acao: "criacao_fornecedor",
    entidade: "supplier",
    entidadeId: created.id,
    detalhes: { name: parsed.data.name },
  });

  revalidatePath("/financeiro/fornecedores");
  return { ok: true, message: "Fornecedor cadastrado." };
}

export async function createSupplierContract(
  input: unknown
): Promise<ActionResult> {
  const session = await requirePermission("financeiro", "criar");
  const parsed = contractSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  const [created] = await db
    .insert(supplierContracts)
    .values({
      supplierId: parsed.data.supplierId,
      title: parsed.data.title,
      startsAt: parsed.data.startsAt,
      endsAt: parsed.data.endsAt || null,
      monthlyValueCents: parsed.data.monthlyValueCents ?? null,
      renewalAlertDays: parsed.data.renewalAlertDays,
      status: "ativo",
    })
    .returning({ id: supplierContracts.id });

  await logAudit({
    userId: session.user.id,
    acao: "criacao_contrato_fornecedor",
    entidade: "supplier_contract",
    entidadeId: created.id,
    detalhes: { title: parsed.data.title },
  });

  revalidatePath("/financeiro/fornecedores");
  return { ok: true, message: "Contrato cadastrado." };
}

export async function closeSupplierContract(
  id: string,
  reason: string
): Promise<ActionResult> {
  const session = await requirePermission("financeiro", "editar");
  await db
    .update(supplierContracts)
    .set({ status: "encerrado", updatedAt: new Date() })
    .where(
      and(eq(supplierContracts.id, id), isNull(supplierContracts.deletedAt))
    );

  await logAudit({
    userId: session.user.id,
    acao: "encerramento_contrato_fornecedor",
    entidade: "supplier_contract",
    entidadeId: id,
    detalhes: { reason },
  });

  revalidatePath("/financeiro/fornecedores");
  return { ok: true, message: "Contrato encerrado." };
}
