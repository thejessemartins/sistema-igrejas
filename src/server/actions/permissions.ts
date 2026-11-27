"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { rolePermissions } from "@/db/schema";
import { requireSession } from "@/lib/session";
import { logAudit } from "@/server/services/audit";
import type { ActionResult } from "./auth";

export async function getRolePermissionOverrides(): Promise<
  Record<string, boolean>
> {
  const rows = await db.select().from(rolePermissions);
  const map: Record<string, boolean> = {};
  for (const r of rows) {
    map[`${r.role}:${r.module}:${r.action}`] = r.allowed;
  }
  return map;
}

export async function toggleRolePermission(
  role: string,
  module: string,
  action: string,
  allowed: boolean
): Promise<ActionResult> {
  const session = await requireSession();
  if (session.user.role !== "admin") {
    return {
      ok: false,
      error: "Apenas administradores podem alterar permissões.",
    };
  }

  await db
    .insert(rolePermissions)
    .values({ role, module, action, allowed, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: [
        rolePermissions.role,
        rolePermissions.module,
        rolePermissions.action,
      ],
      set: { allowed, updatedAt: new Date() },
    });

  await logAudit({
    userId: session.user.id,
    acao: "alteracao_permissao_papel",
    entidade: "role_permission",
    entidadeId: `${role}:${module}:${action}`,
    detalhes: { role, module, action, allowed },
  });

  revalidatePath("/configuracoes/usuarios");
  return { ok: true, message: "Permissão atualizada." };
}
