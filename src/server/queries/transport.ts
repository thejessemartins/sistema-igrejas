import { asc, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { events, eventTrips, tripPassengers, vehicles } from "@/db/schema";

export async function getTransportDashboard() {
  const [vehiclesList, tripsList, eventsList] = await Promise.all([
    db
      .select()
      .from(vehicles)
      .where(isNull(vehicles.deletedAt))
      .orderBy(asc(vehicles.name)),
    db
      .select({
        id: eventTrips.id,
        eventTitle: events.title,
        vehicleName: vehicles.name,
        vehicleCapacity: vehicles.capacity,
        driverText: eventTrips.driverText,
        departureAt: eventTrips.departureAt,
        departurePlaceText: eventTrips.departurePlaceText,
        status: eventTrips.status,
      })
      .from(eventTrips)
      .innerJoin(events, eq(eventTrips.eventId, events.id))
      .innerJoin(vehicles, eq(eventTrips.vehicleId, vehicles.id))
      .where(isNull(eventTrips.deletedAt))
      .orderBy(desc(eventTrips.departureAt)),
    db
      .select({ id: events.id, title: events.title })
      .from(events)
      .where(isNull(events.deletedAt))
      .orderBy(desc(events.startsAt))
      .limit(20),
  ]);

  return { vehicles: vehiclesList, trips: tripsList, events: eventsList };
}

export async function getTripDetail(tripId: string) {
  const [trip] = await db
    .select({
      id: eventTrips.id,
      eventTitle: events.title,
      vehicleName: vehicles.name,
      capacity: vehicles.capacity,
      driverText: eventTrips.driverText,
      departureAt: eventTrips.departureAt,
      departurePlaceText: eventTrips.departurePlaceText,
      status: eventTrips.status,
    })
    .from(eventTrips)
    .innerJoin(events, eq(eventTrips.eventId, events.id))
    .innerJoin(vehicles, eq(eventTrips.vehicleId, vehicles.id))
    .where(eq(eventTrips.id, tripId))
    .limit(1);

  if (!trip) return null;

  const passengers = await db
    .select()
    .from(tripPassengers)
    .where(eq(tripPassengers.tripId, tripId))
    .orderBy(asc(tripPassengers.personName));

  return { trip, passengers };
}
