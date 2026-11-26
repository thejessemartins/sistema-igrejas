"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { assetMovements, assets } from "@/db/schema";
import { requirePermission } from "@/lib/session";
import { assetSchema } from "@/lib/validations";
import { logAudit } from "@/server/services/audit";
import type { ActionResult } from "./auth";

export async function createAsset(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const session = await requirePermission("membros", "criar");
  const parsed = assetSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  const [dup] = await db
    .select({ id: assets.id })
    .from(assets)
    .where(eq(assets.patrimonyCode, parsed.data.patrimonyCode))
    .limit(1);

  if (dup) {
    return {
      ok: false,
      error: "Já existe um bem cadastrado com este código de patrimônio.",
    };
  }

  const [created] = await db
    .insert(assets)
    .values({
      ...parsed.data,
      acquiredAt: parsed.data.acquiredAt || null,
      responsibleMemberId: parsed.data.responsibleMemberId || null,
    })
    .returning({ id: assets.id });

  await db.insert(assetMovements).values({
    assetId: created.id,
    kind: "criacao",
    toLocation: parsed.data.locationText ?? null,
    notes: "Cadastro inicial",
    createdBy: session.user.id,
  });

  await logAudit({
    userId: session.user.id,
    acao: "criacao_patrimonio",
    entidade: "asset",
    entidadeId: created.id,
    detalhes: { code: parsed.data.patrimonyCode },
  });

  revalidatePath("/patrimonio");
  return {
    ok: true,
    message: "Bem cadastrado com sucesso.",
    data: { id: created.id },
  };
}

export async function registerAssetMovement(
  assetId: string,
  kind: string,
  toLocation: string,
  notes: string
): Promise<ActionResult> {
  const session = await requirePermission("membros", "editar");

  if (kind === "baixa" && !notes.trim()) {
    return { ok: false, error: "A baixa exige um motivo." };
  }

  const [asset] = await db
    .select()
    .from(assets)
    .where(eq(assets.id, assetId))
    .limit(1);

  if (!asset) return { ok: false, error: "Bem não encontrado." };

  await db.insert(assetMovements).values({
    assetId,
    kind,
    fromLocation: asset.locationText,
    toLocation: toLocation || asset.locationText,
    notes: notes || null,
    createdBy: session.user.id,
  });

  await db
    .update(assets)
    .set({
      locationText: toLocation || asset.locationText,
      condition: kind === "baixa" ? "baixado" : asset.condition,
      updatedAt: new Date(),
    })
    .where(eq(assets.id, assetId));

  revalidatePath(`/patrimonio/${assetId}`);
  revalidatePath("/patrimonio");
  return { ok: true, message: "Movimentação registrada." };
}
