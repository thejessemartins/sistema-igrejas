import { and, asc, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { reservableResources, reservations, user } from "@/db/schema";
import { requireSession } from "@/lib/session";

export async function getReservableResources() {
  await requireSession();
  return db
    .select()
    .from(reservableResources)
    .where(and(eq(reservableResources.isActive, true), isNull(reservableResources.deletedAt)))
    .orderBy(asc(reservableResources.name));
}

export async function getReservations(params: {
  resourceId?: string;
  status?: string;
} = {}) {
  await requireSession();

  const conditions = [isNull(reservations.deletedAt)];
  if (params.resourceId && params.resourceId !== "all") {
    conditions.push(eq(reservations.resourceId, params.resourceId));
  }
  if (params.status && params.status !== "all") {
    conditions.push(eq(reservations.status, params.status));
  }

  return db
    .select({
      id: reservations.id,
      title: reservations.title,
      resourceId: reservations.resourceId,
      resourceName: reservableResources.name,
      requestedByUserId: reservations.requestedByUserId,
      requestedByName: user.name,
      startsAt: reservations.startsAt,
      endsAt: reservations.endsAt,
      status: reservations.status,
      decisionNotes: reservations.decisionNotes,
    })
    .from(reservations)
    .innerJoin(
      reservableResources,
      eq(reservations.resourceId, reservableResources.id)
    )
    .innerJoin(user, eq(reservations.requestedByUserId, user.id))
    .where(and(...conditions))
    .orderBy(desc(reservations.startsAt));
}
