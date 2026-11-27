import { asc, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import {
  events,
  kidsCheckins,
  kidsChildren,
  kidsGuardians,
} from "@/db/schema";

export async function getKidsCheckinDashboard() {
  const [children, guardians, checkins, eventsList] = await Promise.all([
    db
      .select()
      .from(kidsChildren)
      .where(isNull(kidsChildren.deletedAt))
      .orderBy(asc(kidsChildren.fullName)),
    db.select().from(kidsGuardians),
    db
      .select({
        id: kidsCheckins.id,
        childId: kidsCheckins.childId,
        childName: kidsChildren.fullName,
        allergies: kidsChildren.allergiesOrRestrictions,
        pickupCode: kidsCheckins.pickupCode,
        roomText: kidsCheckins.roomText,
        checkedInAt: kidsCheckins.checkedInAt,
        checkedOutAt: kidsCheckins.checkedOutAt,
      })
      .from(kidsCheckins)
      .innerJoin(kidsChildren, eq(kidsCheckins.childId, kidsChildren.id))
      .orderBy(desc(kidsCheckins.checkedInAt))
      .limit(50),
    db
      .select({ id: events.id, title: events.title })
      .from(events)
      .where(isNull(events.deletedAt))
      .orderBy(desc(events.startsAt))
      .limit(10),
  ]);

  return { children, guardians, checkins, events: eventsList };
}
