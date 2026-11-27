"use server";

import { revalidatePath } from "next/cache";
import { and, eq, gt, isNull, lt, ne } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { pastoralAppointments, pastoralNotes } from "@/db/schema";
import { requireSession } from "@/lib/session";
import type { ActionResult } from "./auth";

const appointmentSchema = z.object({
  pastorUserId: z.string().min(1),
  personName: z.string().trim().min(2, "Nome é obrigatório"),
  phone: z.string().trim().optional().nullable(),
  reasonCategory: z.enum([
    "aconselhamento",
    "oracao",
    "familia",
    "luto",
    "visita",
    "outro",
  ]),
  startsAt: z.string().min(1),
  endsAt: z.string().min(1),
  placeText: z.string().trim().optional().nullable(),
});

export async function createPastoralAppointment(
  input: unknown
): Promise<ActionResult> {
  const session = await requireSession();
  const parsed = appointmentSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  const start = new Date(parsed.data.startsAt);
  const end = new Date(parsed.data.endsAt);
  if (end <= start) {
    return { ok: false, error: "Horário final deve ser maior que o inicial." };
  }

  const conflicts = await db
    .select({ id: pastoralAppointments.id })
    .from(pastoralAppointments)
    .where(
      and(
        eq(pastoralAppointments.pastorUserId, parsed.data.pastorUserId),
        isNull(pastoralAppointments.deletedAt),
        ne(pastoralAppointments.status, "cancelado"),
        lt(pastoralAppointments.startsAt, end),
        gt(pastoralAppointments.endsAt, start)
      )
    )
    .limit(1);

  if (conflicts.length > 0) {
    return {
      ok: false,
      error: "Conflito de horário: o pastor já possui atendimento neste período.",
    };
  }

  await db.insert(pastoralAppointments).values({
    pastorUserId: parsed.data.pastorUserId,
    personName: parsed.data.personName,
    phone: parsed.data.phone || null,
    reasonCategory: parsed.data.reasonCategory,
    startsAt: start,
    endsAt: end,
    placeText: parsed.data.placeText || null,
    status: "solicitado",
    createdBy: session.user.id,
  });

  revalidatePath("/agenda-pastoral");
  return { ok: true, message: "Atendimento solicitado com sucesso." };
}

export async function updatePastoralAppointmentStatus(
  id: string,
  status: "confirmado" | "realizado" | "cancelado" | "faltou",
  cancelReason?: string
): Promise<ActionResult> {
  await requireSession();
  await db
    .update(pastoralAppointments)
    .set({
      status,
      cancelReason: cancelReason || null,
      updatedAt: new Date(),
    })
    .where(eq(pastoralAppointments.id, id));

  revalidatePath("/agenda-pastoral");
  revalidatePath(`/agenda-pastoral/${id}`);
  return { ok: true, message: `Status atualizado para ${status}.` };
}

export async function savePastoralNote(
  appointmentId: string,
  body: string
): Promise<ActionResult> {
  const session = await requireSession();
  const [appt] = await db
    .select({ pastorUserId: pastoralAppointments.pastorUserId })
    .from(pastoralAppointments)
    .where(eq(pastoralAppointments.id, appointmentId))
    .limit(1);

  if (!appt || appt.pastorUserId !== session.user.id) {
    return { ok: false, error: "Apenas o pastor responsável pode editar a nota." };
  }

  await db
    .insert(pastoralNotes)
    .values({
      appointmentId,
      pastorUserId: session.user.id,
      body,
    })
    .onConflictDoUpdate({
      target: pastoralNotes.appointmentId,
      set: { body, updatedAt: new Date() },
    });

  revalidatePath(`/agenda-pastoral/${appointmentId}`);
  return { ok: true, message: "Nota privada salva." };
}
