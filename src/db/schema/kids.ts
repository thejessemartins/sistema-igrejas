import {
  boolean,
  date,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { events } from "./events";
import { members } from "./members";

export const kidsChildren = pgTable("kids_children", {
  id: uuid("id").defaultRandom().primaryKey(),
  fullName: text("full_name").notNull(),
  birthDate: date("birth_date"),
  allergiesOrRestrictions: text("allergies_or_restrictions"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

export const kidsGuardians = pgTable("kids_guardians", {
  id: uuid("id").defaultRandom().primaryKey(),
  childId: uuid("child_id")
    .notNull()
    .references(() => kidsChildren.id, { onDelete: "cascade" }),
  guardianMemberId: uuid("guardian_member_id").references(() => members.id, {
    onDelete: "set null",
  }),
  guardianName: text("guardian_name").notNull(),
  guardianPhone: text("guardian_phone"),
  relation: text("relation").notNull(),
  isAuthorizedPickup: boolean("is_authorized_pickup").notNull().default(true),
});

export const kidsCheckins = pgTable("kids_checkins", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventId: uuid("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  childId: uuid("child_id")
    .notNull()
    .references(() => kidsChildren.id, { onDelete: "cascade" }),
  checkedInAt: timestamp("checked_in_at").notNull().defaultNow(),
  checkedInBy: text("checked_in_by").references(() => user.id, {
    onDelete: "set null",
  }),
  pickupCode: text("pickup_code").notNull(),
  checkedOutAt: timestamp("checked_out_at"),
  checkedOutBy: text("checked_out_by").references(() => user.id, {
    onDelete: "set null",
  }),
  pickedUpByGuardianId: uuid("picked_up_by_guardian_id").references(
    () => kidsGuardians.id,
    { onDelete: "set null" }
  ),
  roomText: text("room_text"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
