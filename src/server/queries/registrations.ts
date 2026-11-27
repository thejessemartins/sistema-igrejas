import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { eventRegistrations, eventRegistrationsConfig } from "@/db/schema";

export async function getEventRegistrationData(eventId: string) {
  const [[config], registrations] = await Promise.all([
    db
      .select()
      .from(eventRegistrationsConfig)
      .where(eq(eventRegistrationsConfig.eventId, eventId))
      .limit(1),
    db
      .select()
      .from(eventRegistrations)
      .where(eq(eventRegistrations.eventId, eventId))
      .orderBy(asc(eventRegistrations.registeredAt)),
  ]);

  return { config: config ?? null, registrations };
}
