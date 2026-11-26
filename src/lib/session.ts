import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { userProfiles } from "@/db/schema";
import {
  hasPermission,
  type ActionName,
  type ModuleName,
  type Role,
} from "@/lib/permissions";

export interface AppSession {
  user: {
    id: string;
    name: string;
    email: string;
    role: Role;
    active: boolean;
    memberId: string | null;
  };
}

export async function getServerSession(): Promise<AppSession | null> {
  const reqHeaders = await headers();
  const sessionData = await auth.api.getSession({ headers: reqHeaders });
  if (!sessionData?.user) return null;

  const [profile] = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, sessionData.user.id))
    .limit(1);

  if (!profile || !profile.active) {
    return null;
  }

  return {
    user: {
      id: sessionData.user.id,
      name: sessionData.user.name,
      email: sessionData.user.email,
      role: profile.role as Role,
      active: profile.active,
      memberId: profile.memberId,
    },
  };
}

export async function requireSession(): Promise<AppSession> {
  const session = await getServerSession();
  if (!session) {
    redirect("/entrar");
  }
  return session;
}

export async function requirePermission(
  modulo: ModuleName,
  acao: ActionName
): Promise<AppSession> {
  const session = await requireSession();
  if (!hasPermission(session, modulo, acao)) {
    throw new Error("Acesso negado: você não tem permissão para esta ação.");
  }
  return session;
}
