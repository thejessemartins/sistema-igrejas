"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { eventTrips, tripPassengers, vehicles } from "@/db/schema";
import { requireSession } from "@/lib/session";
import type { ActionResult } from "./auth";

const vehicleSchema = z.object({
  name: z.string().trim().min(2, "Nome é obrigatório"),
  plateText: z.string().trim().optional().nullable(),
  capacity: z.coerce.number().int().positive("Capacidade deve ser > 0"),
  kind: z.enum(["onibus", "van", "carro", "outro"]),
});

const tripSchema = z.object({
  eventId: z.string().uuid(),
  vehicleId: z.string().uuid(),
  driverText: z.string().trim().optional().nullable(),
  departureAt: z.string().min(1),
  departurePlaceText: z.string().trim().min(2, "Local de saída obrigatório"),
});

export async function createVehicle(input: unknown): Promise<ActionResult> {
  await requireSession();
  const parsed = vehicleSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  await db.insert(vehicles).values({
    ...parsed.data,
    plateText: parsed.data.plateText || null,
  });

  revalidatePath("/transporte");
  return { ok: true, message: "Veículo cadastrado." };
}

export async function createEventTrip(input: unknown): Promise<ActionResult> {
  await requireSession();
  const parsed = tripSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  await db.insert(eventTrips).values({
    eventId: parsed.data.eventId,
    vehicleId: parsed.data.vehicleId,
    driverText: parsed.data.driverText || null,
    departureAt: new Date(parsed.data.departureAt),
    departurePlaceText: parsed.data.departurePlaceText,
  });

  revalidatePath("/transporte");
  return { ok: true, message: "Viagem criada." };
}

export async function addTripPassenger(
  tripId: string,
  personName: string,
  phone?: string
): Promise<ActionResult> {
  await requireSession();
  if (!personName.trim()) {
    return { ok: false, error: "Nome do passageiro é obrigatório." };
  }

  try {
    await db.transaction(async (tx) => {
      const [trip] = await tx
        .select({
          id: eventTrips.id,
          capacity: vehicles.capacity,
        })
        .from(eventTrips)
        .innerJoin(vehicles, eq(eventTrips.vehicleId, vehicles.id))
        .where(eq(eventTrips.id, tripId))
        .limit(1);

      if (!trip) throw new Error("Viagem não encontrada.");

      const current = await tx
        .select({ id: tripPassengers.id })
        .from(tripPassengers)
        .where(eq(tripPassengers.tripId, tripId));

      if (current.length >= trip.capacity) {
        throw new Error(
          `Capacidade máxima do veículo (${trip.capacity} lugares) atingida.`
        );
      }

      await tx.insert(tripPassengers).values({
        tripId,
        personName: personName.trim(),
        phone: phone?.trim() || null,
      });
    });

    revalidatePath(`/transporte/viagens/${tripId}`);
    return { ok: true, message: "Passageiro adicionado." };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Erro ao adicionar.",
    };
  }
}

export async function togglePassengerBoarded(
  passengerId: string,
  boarded: boolean,
  tripId: string
): Promise<ActionResult> {
  await requireSession();
  await db
    .update(tripPassengers)
    .set({ boarded })
    .where(eq(tripPassengers.id, passengerId));
  revalidatePath(`/transporte/viagens/${tripId}`);
  return { ok: true, message: "Embarque atualizado." };
}

export async function removeTripPassenger(
  passengerId: string,
  tripId: string
): Promise<ActionResult> {
  await requireSession();
  await db.delete(tripPassengers).where(eq(tripPassengers.id, passengerId));
  revalidatePath(`/transporte/viagens/${tripId}`);
  return { ok: true, message: "Passageiro removido." };
}
