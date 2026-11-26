"use server";

import { revalidatePath } from "next/cache";
import { and, count, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { user, userProfiles } from "@/db/schema";
import { requirePermission } from "@/lib/session";
import { createUserSchema, updateUserSchema } from "@/lib/validations";
import { logAudit } from "@/server/services/audit";
import type { ActionResult } from "./auth";

export async function createUserAction(
  input: unknown
): Promise<ActionResult> {
  const session = await requirePermission("usuarios", "criar");
  const parsed = createUserSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  const email = parsed.data.email.toLowerCase();
  const [existing] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, email))
    .limit(1);

  if (existing) {
    return { ok: false, error: "Já existe um usuário com este e-mail." };
  }

  const created = await auth.api.signUpEmail({
    body: {
      name: parsed.data.name,
      email,
      password: parsed.data.password,
    },
  });

  if (!created?.user) {
    return { ok: false, error: "Não foi possível criar o usuário." };
  }

  await db.insert(userProfiles).values({
    userId: created.user.id,
    role: parsed.data.role,
    active: parsed.data.active,
  });

  await logAudit({
    userId: session.user.id,
    acao: "criacao_usuario",
    entidade: "user",
    entidadeId: created.user.id,
    detalhes: { papel: parsed.data.role, ativo: parsed.data.active },
  });

  revalidatePath("/configuracoes/usuarios");
  return { ok: true, message: "Usuário criado com sucesso." };
}

export async function updateUserAction(
  input: unknown
): Promise<ActionResult> {
  const session = await requirePermission("usuarios", "editar");
  const parsed = updateUserSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  const { userId, name, role, active } = parsed.data;

  if (userId === session.user.id && !active) {
    return { ok: false, error: "Você não pode inativar o próprio usuário." };
  }

  const [currentProfile] = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1);

  if (!currentProfile) {
    return { ok: false, error: "Usuário não encontrado." };
  }

  // Impede inativar ou rebaixar o último admin ativo
  if (currentProfile.role === "admin" && (!active || role !== "admin")) {
    const [adminCount] = await db
      .select({ total: count() })
      .from(userProfiles)
      .where(and(eq(userProfiles.role, "admin"), eq(userProfiles.active, true)));

    if ((adminCount?.total ?? 0) <= 1) {
      return {
        ok: false,
        error: "Não é possível remover ou inativar o último administrador ativo.",
      };
    }
  }

  await db
    .update(user)
    .set({ name, updatedAt: new Date() })
    .where(eq(user.id, userId));

  await db
    .update(userProfiles)
    .set({ role, active, updatedAt: new Date() })
    .where(eq(userProfiles.userId, userId));

  const acao =
    currentProfile.active !== active
      ? active
        ? "ativacao_usuario"
        : "inativacao_usuario"
      : currentProfile.role !== role
        ? "mudanca_papel"
        : "edicao_usuario";

  await logAudit({
    userId: session.user.id,
    acao,
    entidade: "user",
    entidadeId: userId,
    detalhes: {
      papelAnterior: currentProfile.role,
      papelNovo: role,
      ativo: active,
    },
  });

  revalidatePath("/configuracoes/usuarios");
  return { ok: true, message: "Usuário atualizado com sucesso." };
}
