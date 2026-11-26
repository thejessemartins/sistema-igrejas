import { and, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { ceremonies, ceremonyParticipants } from "@/db/schema";
import { requireSession } from "@/lib/session";

export async function getCeremonies() {
  await requireSession();
  return db
    .select()
    .from(ceremonies)
    .where(isNull(ceremonies.deletedAt))
    .orderBy(desc(ceremonies.createdAt));
}

export async function getCeremonyById(id: string) {
  await requireSession();

  const [ceremony] = await db
    .select()
    .from(ceremonies)
    .where(and(eq(ceremonies.id, id), isNull(ceremonies.deletedAt)))
    .limit(1);

  if (!ceremony) return null;

  const participants = await db
    .select()
    .from(ceremonyParticipants)
    .where(eq(ceremonyParticipants.ceremonyId, id));

  return { ceremony, participants };
}
