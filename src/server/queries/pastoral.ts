import { and, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import {
  pastoralAppointments,
  pastoralNotes,
  user,
  userProfiles,
} from "@/db/schema";
import { logAudit } from "@/server/services/audit";

export async function getPastorsList() {
  return db
    .select({ id: user.id, name: user.name })
    .from(user)
    .innerJoin(userProfiles, eq(user.id, userProfiles.userId))
    .where(eq(userProfiles.role, "pastor"));
}

export async function getPastoralScheduleForPastor(pastorUserId: string) {
  return db
    .select()
    .from(pastoralAppointments)
    .where(
      and(
        eq(pastoralAppointments.pastorUserId, pastorUserId),
        isNull(pastoralAppointments.deletedAt)
      )
    )
    .orderBy(desc(pastoralAppointments.startsAt));
}

/**
 * Visão reduzida para secretaria: apenas horários e categoria, sem notas.
 */
export async function getPastoralScheduleReduced() {
  return db
    .select({
      id: pastoralAppointments.id,
      reasonCategory: pastoralAppointments.reasonCategory,
      startsAt: pastoralAppointments.startsAt,
      endsAt: pastoralAppointments.endsAt,
      status: pastoralAppointments.status,
      personName: pastoralAppointments.personName,
    })
    .from(pastoralAppointments)
    .where(isNull(pastoralAppointments.deletedAt))
    .orderBy(desc(pastoralAppointments.startsAt));
}

export async function getPastoralAppointmentDetail(
  id: string,
  userId: string,
  role: string
) {
  const [appt] = await db
    .select()
    .from(pastoralAppointments)
    .where(
      and(
        eq(pastoralAppointments.id, id),
        isNull(pastoralAppointments.deletedAt)
      )
    )
    .limit(1);

  if (!appt) return null;

  const isOwnerPastor = appt.pastorUserId === userId;
  const isAdminSupport = role === "admin";
  let noteBody: string | null = null;

  if (isOwnerPastor || isAdminSupport) {
    const [note] = await db
      .select({ body: pastoralNotes.body })
      .from(pastoralNotes)
      .where(eq(pastoralNotes.appointmentId, id))
      .limit(1);

    noteBody = note?.body ?? null;

    if (isAdminSupport && !isOwnerPastor && note) {
      await logAudit({
        userId,
        acao: "leitura_suporte_nota_pastoral",
        entidade: "pastoral_note",
        entidadeId: id,
        detalhes: {},
      });
    }
  }

  return {
    appointment: appt,
    canSeeNote: isOwnerPastor || isAdminSupport,
    isOwnerPastor,
    noteBody,
  };
}
