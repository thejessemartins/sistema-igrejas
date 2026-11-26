"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { user, userProfiles } from "@/db/schema";
import {
  changePasswordSchema,
  loginSchema,
  recoverPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
} from "@/lib/validations";
import {
  checkLoginRateLimit,
  resetLoginRateLimit,
} from "@/lib/rate-limit";
import { getServerSession, requireSession } from "@/lib/session";
import { logAudit } from "@/server/services/audit";

export type ActionResult<T = undefined> =
  | { ok: true; message: string; data?: T }
  | { ok: false; error: string };

export async function loginAction(
  input: unknown
): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  const email = parsed.data.email.toLowerCase();
  const rate = checkLoginRateLimit(email);
  if (!rate.allowed) {
    return {
      ok: false,
      error: `Muitas tentativas de login. Tente novamente em ${rate.retryAfterSeconds}s.`,
    };
  }

  try {
    const reqHeaders = await headers();
    const res = await auth.api.signInEmail({
      body: {
        email,
        password: parsed.data.password,
      },
      headers: reqHeaders,
    });

    if (!res?.user) {
      return { ok: false, error: "E-mail ou senha inválidos." };
    }

    const [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, res.user.id))
      .limit(1);

    if (!profile || !profile.active) {
      await auth.api.signOut({ headers: reqHeaders });
      return {
        ok: false,
        error: "E-mail ou senha inválidos.",
      };
    }

    resetLoginRateLimit(email);
    await logAudit({
      userId: res.user.id,
      acao: "login",
      entidade: "session",
      entidadeId: res.user.id,
      detalhes: { papel: profile.role },
    });

    return { ok: true, message: "Login realizado com sucesso." };
  } catch {
    return { ok: false, error: "E-mail ou senha inválidos." };
  }
}

export async function logoutAction(): Promise<void> {
  const session = await getServerSession();
  const reqHeaders = await headers();

  if (session) {
    await logAudit({
      userId: session.user.id,
      acao: "logout",
      entidade: "session",
      entidadeId: session.user.id,
    });
  }

  await auth.api.signOut({ headers: reqHeaders });
  redirect("/entrar");
}

export async function recoverPasswordAction(
  input: unknown
): Promise<ActionResult<{ devToken?: string }>> {
  const parsed = recoverPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "E-mail inválido.",
    };
  }

  const [found] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, parsed.data.email.toLowerCase()))
    .limit(1);

  if (found) {
    await logAudit({
      userId: found.id,
      acao: "solicitacao_recuperacao_senha",
      entidade: "user",
      entidadeId: found.id,
    });
  }

  return {
    ok: true,
    message:
      "Se o e-mail existir no sistema, uma instrução de redefinição local foi gerada.",
    data: {
      devToken: process.env.NODE_ENV !== "production" ? "dev-reset-local" : undefined,
    },
  };
}

export async function resetPasswordAction(
  input: unknown
): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  try {
    await auth.api.resetPassword({
      body: {
        newPassword: parsed.data.newPassword,
        token: parsed.data.token,
      },
    });
    return { ok: true, message: "Senha redefinida com sucesso." };
  } catch {
    return {
      ok: false,
      error: "Não foi possível redefinir a senha. Verifique o token informado.",
    };
  }
}

export async function updateProfileAction(
  input: unknown
): Promise<ActionResult> {
  const session = await requireSession();
  const parsed = updateProfileSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  await db
    .update(user)
    .set({ name: parsed.data.name, updatedAt: new Date() })
    .where(eq(user.id, session.user.id));

  await logAudit({
    userId: session.user.id,
    acao: "edicao_perfil",
    entidade: "user",
    entidadeId: session.user.id,
  });

  return { ok: true, message: "Perfil atualizado com sucesso." };
}

export async function changePasswordAction(
  input: unknown
): Promise<ActionResult> {
  const session = await requireSession();
  const parsed = changePasswordSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  try {
    const reqHeaders = await headers();
    await auth.api.changePassword({
      body: {
        currentPassword: parsed.data.currentPassword,
        newPassword: parsed.data.newPassword,
      },
      headers: reqHeaders,
    });

    await logAudit({
      userId: session.user.id,
      acao: "troca_senha",
      entidade: "user",
      entidadeId: session.user.id,
    });

    return { ok: true, message: "Senha alterada com sucesso." };
  } catch {
    return { ok: false, error: "Senha atual incorreta." };
  }
}
