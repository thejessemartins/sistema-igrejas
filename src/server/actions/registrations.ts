"use server";

import { revalidatePath } from "next/cache";
import { and, asc, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { eventRegistrations, eventRegistrationsConfig } from "@/db/schema";
import { requireSession } from "@/lib/session";
import { logAudit } from "@/server/services/audit";
import type { ActionResult } from "./auth";

const configSchema = z.object({
  eventId: z.string().uuid(),
  capacity: z.coerce.number().int().positive(),
  priceCents: z.coerce.number().int().min(0).default(0),
  isEnabled: z.boolean().default(true),
});

const registerSchema = z.object({
  eventId: z.string().uuid(),
  memberId: z.string().uuid().optional().nullable(),
  visitorId: z.string().uuid().optional().nullable(),
  personName: z.string().trim().min(2, "Nome é obrigatório"),
  phone: z.string().trim().optional().nullable(),
});

export async function configureEventRegistration(
  input: unknown
): Promise<ActionResult> {
  await requireSession();
  const parsed = configSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  const now = new Date();
  const ends = new Date(now);
  ends.setMonth(ends.getMonth() + 3);

  await db
    .insert(eventRegistrationsConfig)
    .values({
      eventId: parsed.data.eventId,
      capacity: parsed.data.capacity,
      priceCents: parsed.data.priceCents,
      isEnabled: parsed.data.isEnabled,
      registrationStartsAt: now,
      registrationEndsAt: ends,
    })
    .onConflictDoUpdate({
      target: eventRegistrationsConfig.eventId,
      set: {
        capacity: parsed.data.capacity,
        priceCents: parsed.data.priceCents,
        isEnabled: parsed.data.isEnabled,
      },
    });

  revalidatePath(`/cultos/${parsed.data.eventId}`);
  revalidatePath(`/cultos/${parsed.data.eventId}/inscrever`);
  return { ok: true, message: "Configuração de inscrições salva." };
}

export async function registerForEvent(input: unknown): Promise<ActionResult> {
  await requireSession();
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  const status = await db.transaction(async (tx) => {
    const [cfg] = await tx
      .select()
      .from(eventRegistrationsConfig)
      .where(eq(eventRegistrationsConfig.eventId, parsed.data.eventId))
      .limit(1);

    const confirmed = await tx
      .select({ id: eventRegistrations.id })
      .from(eventRegistrations)
      .where(
        and(
          eq(eventRegistrations.eventId, parsed.data.eventId),
          inArray(eventRegistrations.status, ["confirmada", "compareceu"])
        )
      );

    const isFull = cfg ? confirmed.length >= cfg.capacity : false;
    const nextStatus = isFull ? "lista_espera" : "confirmada";

    await tx.insert(eventRegistrations).values({
      eventId: parsed.data.eventId,
      memberId: parsed.data.memberId || null,
      visitorId: parsed.data.visitorId || null,
      personName: parsed.data.personName,
      phone: parsed.data.phone || null,
      status: nextStatus,
    });

    return nextStatus;
  });

  revalidatePath(`/cultos/${parsed.data.eventId}`);
  revalidatePath(`/cultos/${parsed.data.eventId}/inscrever`);
  return {
    ok: true,
    message:
      status === "lista_espera"
        ? "Vagas esgotadas: inscrição adicionada à lista de espera."
        : "Inscrição confirmada!",
  };
}

export async function cancelEventRegistration(
  registrationId: string
): Promise<ActionResult> {
  const session = await requireSession();

  const result = await db.transaction(async (tx) => {
    const [reg] = await tx
      .select()
      .from(eventRegistrations)
      .where(eq(eventRegistrations.id, registrationId))
      .limit(1);

    if (!reg) return null;

    await tx
      .update(eventRegistrations)
      .set({ status: "cancelada" })
      .where(eq(eventRegistrations.id, registrationId));

    let promotedId: string | null = null;
    if (reg.status === "confirmada") {
      const [nextWait] = await tx
        .select()
        .from(eventRegistrations)
        .where(
          and(
            eq(eventRegistrations.eventId, reg.eventId),
            eq(eventRegistrations.status, "lista_espera")
          )
        )
        .orderBy(asc(eventRegistrations.registeredAt))
        .limit(1);

      if (nextWait) {
        await tx
          .update(eventRegistrations)
          .set({ status: "confirmada" })
          .where(eq(eventRegistrations.id, nextWait.id));
        promotedId = nextWait.id;
      }
    }

    return { eventId: reg.eventId, promotedId };
  });

  if (!result) return { ok: false, error: "Inscrição não encontrada." };

  if (result.promotedId) {
    await logAudit({
      userId: session.user.id,
      acao: "promocao_lista_espera_evento",
      entidade: "event_registration",
      entidadeId: result.promotedId,
      detalhes: { eventId: result.eventId },
    });
  }

  revalidatePath(`/cultos/${result.eventId}`);
  revalidatePath(`/cultos/${result.eventId}/inscrever`);
  return { ok: true, message: "Inscrição cancelada." };
}

export async function checkInRegistration(
  registrationId: string
): Promise<ActionResult> {
  await requireSession();
  const [reg] = await db
    .update(eventRegistrations)
    .set({ status: "compareceu", checkedInAt: new Date() })
    .where(eq(eventRegistrations.id, registrationId))
    .returning({ eventId: eventRegistrations.eventId });

  if (!reg) return { ok: false, error: "Inscrição não encontrada." };

  revalidatePath(`/cultos/${reg.eventId}`);
  revalidatePath(`/cultos/${reg.eventId}/inscrever`);
  return { ok: true, message: "Check-in realizado!" };
}
