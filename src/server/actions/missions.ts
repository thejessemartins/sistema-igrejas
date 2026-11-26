"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { itemDonations, socialProjects } from "@/db/schema";
import { requirePermission } from "@/lib/session";
import { logAudit } from "@/server/services/audit";
import type { ActionResult } from "./auth";

export async function createSocialProject(input: {
  name: string;
  kind: string;
  startsAt: string;
  description?: string;
}): Promise<ActionResult> {
  const session = await requirePermission("membros", "criar");
  if (!input.name.trim()) {
    return { ok: false, error: "Nome do projeto é obrigatório." };
  }

  const [created] = await db
    .insert(socialProjects)
    .values({
      name: input.name.trim(),
      kind: input.kind,
      startsAt: input.startsAt,
      description: input.description?.trim() || null,
      status: "ativo",
    })
    .returning({ id: socialProjects.id });

  await logAudit({
    userId: session.user.id,
    acao: "criacao_projeto_social",
    entidade: "social_project",
    entidadeId: created.id,
  });

  revalidatePath("/missoes");
  return { ok: true, message: "Projeto criado com sucesso." };
}

export async function registerItemDonation(input: {
  projectId: string;
  itemDescription: string;
  quantity: number;
  unit: string;
  donorText?: string;
}): Promise<ActionResult> {
  const session = await requirePermission("membros", "editar");
  if (!input.itemDescription.trim() || input.quantity <= 0) {
    return { ok: false, error: "Informe o item e quantidade válida." };
  }

  await db.insert(itemDonations).values({
    projectId: input.projectId,
    itemDescription: input.itemDescription.trim(),
    quantity: input.quantity,
    unit: input.unit || "un",
    donorText: input.donorText?.trim() || null,
    donatedAt: new Date().toISOString().slice(0, 10),
    createdBy: session.user.id,
  });

  revalidatePath(`/missoes/${input.projectId}`);
  return { ok: true, message: "Doação registrada." };
}
