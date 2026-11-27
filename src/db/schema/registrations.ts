import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { events } from "./events";
import { members } from "./members";
import { visitors } from "./visitors";

export const eventRegistrationsConfig = pgTable("event_registrations_config", {
  eventId: uuid("event_id")
    .primaryKey()
    .references(() => events.id, { onDelete: "cascade" }),
  capacity: integer("capacity").notNull(),
  registrationStartsAt: timestamp("registration_starts_at").notNull(),
  registrationEndsAt: timestamp("registration_ends_at").notNull(),
  priceCents: integer("price_cents").notNull().default(0),
  isEnabled: boolean("is_enabled").notNull().default(true),
});

export const eventRegistrations = pgTable("event_registrations", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventId: uuid("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  memberId: uuid("member_id").references(() => members.id, {
    onDelete: "set null",
  }),
  visitorId: uuid("visitor_id").references(() => visitors.id, {
    onDelete: "set null",
  }),
  personName: text("person_name").notNull(),
  phone: text("phone"),
  status: text("status").notNull().default("confirmada"), // confirmada | lista_espera | cancelada | compareceu
  paidManually: boolean("paid_manually").notNull().default(false),
  confirmedBy: text("confirmed_by").references(() => user.id, {
    onDelete: "set null",
  }),
  confirmedAt: timestamp("confirmed_at"),
  registeredAt: timestamp("registered_at").notNull().defaultNow(),
  checkedInAt: timestamp("checked_in_at"),
});
