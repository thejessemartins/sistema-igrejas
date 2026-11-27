"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import {
  memberAvailability,
  memberSkills,
  notices,
  skillTags,
} from "@/db/schema";
import { requireSession } from "@/lib/session";
import type { ActionResult } from "./auth";

const tagSchema = z.object({
  name: z.string().trim().min(2, "Nome é obrigatório"),
  category: z.enum([
    "musica",
    "tecnica",
    "manual",
    "ensino",
    "cuidado",
    "administracao",
    "outro",
  ]),
});

export async function createSkillTag(input: unknown): Promise<ActionResult> {
  await requireSession();
  const parsed = tagSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  await db
    .insert(skillTags)
    .values({
      name: parsed.data.name.toLowerCase(),
      category: parsed.data.category,
    })
    .onConflictDoNothing();

  revalidatePath("/ministerios/talentos");
  return { ok: true, message: "Habilidade cadastrada." };
}

export async function assignMemberSkill(
  memberId: string,
  skillTagId: string,
  level: "iniciante" | "intermediario" | "avancado",
  notes?: string
): Promise<ActionResult> {
  await requireSession();
  await db
    .insert(memberSkills)
    .values({ memberId, skillTagId, level, notes: notes || null })
    .onConflictDoUpdate({
      target: [memberSkills.memberId, memberSkills.skillTagId],
      set: { level, notes: notes || null },
    });

  revalidatePath("/ministerios/talentos");
  return { ok: true, message: "Talento atribuído ao membro." };
}

export async function addMemberAvailability(
  memberId: string,
  weekday: number,
  period: "manha" | "tarde" | "noite"
): Promise<ActionResult> {
  await requireSession();
  await db
    .insert(memberAvailability)
    .values({ memberId, weekday, period })
    .onConflictDoNothing();

  revalidatePath("/ministerios/talentos");
  return { ok: true, message: "Disponibilidade registrada." };
}

export async function inviteMemberByTalent(
  memberName: string,
  skillName: string
): Promise<ActionResult> {
  const session = await requireSession();
  await db.insert(notices).values({
    title: `Convite para servir: ${skillName}`,
    body: `Olá ${memberName}, a liderança gostaria de convidá-lo(a) para servir com sua habilidade em ${skillName}.`,
    audienceType: "todos",
    authorUserId: session.user.id,
  });

  revalidatePath("/avisos");
  return { ok: true, message: `Convite interno criado para ${memberName}.` };
}
