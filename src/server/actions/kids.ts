"use server";

import { revalidatePath } from "next/cache";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { kidsCheckins, kidsChildren, kidsGuardians } from "@/db/schema";
import { requireSession } from "@/lib/session";
import type { ActionResult } from "./auth";

const kidSchema = z.object({
  fullName: z.string().trim().min(2, "Nome da criança obrigatório"),
  birthDate: z.string().optional().nullable(),
  allergiesOrRestrictions: z.string().trim().optional().nullable(),
  guardianName: z.string().trim().min(2, "Nome do responsável obrigatório"),
  guardianPhone: z.string().trim().optional().nullable(),
  relation: z.string().trim().min(2).default("Responsável"),
  isAuthorizedPickup: z.boolean().default(true),
});

export async function createKidWithGuardian(
  input: unknown
): Promise<ActionResult> {
  await requireSession();
  const parsed = kidSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  await db.transaction(async (tx) => {
    const [child] = await tx
      .insert(kidsChildren)
      .values({
        fullName: parsed.data.fullName,
        birthDate: parsed.data.birthDate || null,
        allergiesOrRestrictions: parsed.data.allergiesOrRestrictions || null,
      })
      .returning({ id: kidsChildren.id });

    await tx.insert(kidsGuardians).values({
      childId: child.id,
      guardianName: parsed.data.guardianName,
      guardianPhone: parsed.data.guardianPhone || null,
      relation: parsed.data.relation,
      isAuthorizedPickup: parsed.data.isAuthorizedPickup,
    });
  });

  revalidatePath("/infantil/check-in");
  return { ok: true, message: "Criança cadastrada." };
}

export async function checkInKid(
  eventId: string,
  childId: string,
  roomText?: string
): Promise<ActionResult> {
  const session = await requireSession();
  const code = Math.random().toString(36).substring(2, 6).toUpperCase();

  await db.insert(kidsCheckins).values({
    eventId,
    childId,
    pickupCode: code,
    roomText: roomText || "Sala Geral",
    checkedInBy: session.user.id,
  });

  revalidatePath("/infantil/check-in");
  return { ok: true, message: `Check-in feito! Código de retirada: ${code}` };
}

export async function checkOutKid(
  checkinId: string,
  pickupCode: string,
  guardianId: string
): Promise<ActionResult> {
  const session = await requireSession();

  const [checkin] = await db
    .select()
    .from(kidsCheckins)
    .where(and(eq(kidsCheckins.id, checkinId), isNull(kidsCheckins.checkedOutAt)))
    .limit(1);

  if (!checkin) {
    return { ok: false, error: "Check-in não encontrado ou já retirado." };
  }

  if (checkin.pickupCode.toUpperCase() !== pickupCode.trim().toUpperCase()) {
    return { ok: false, error: "Código de retirada inválido." };
  }

  const [guardian] = await db
    .select()
    .from(kidsGuardians)
    .where(eq(kidsGuardians.id, guardianId))
    .limit(1);

  if (!guardian || !guardian.isAuthorizedPickup) {
    return {
      ok: false,
      error: "Responsável não autorizado para retirada.",
    };
  }

  await db
    .update(kidsCheckins)
    .set({
      checkedOutAt: new Date(),
      checkedOutBy: session.user.id,
      pickedUpByGuardianId: guardianId,
    })
    .where(eq(kidsCheckins.id, checkinId));

  revalidatePath("/infantil/check-in");
  return { ok: true, message: "Retirada confirmada com segurança." };
}
