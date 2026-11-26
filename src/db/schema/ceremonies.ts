import {
  boolean,
  date,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { events } from "./events";
import { members } from "./members";

export const ceremonies = pgTable("ceremonies", {
  id: uuid("id").defaultRandom().primaryKey(),
  kind: text("kind").notNull(), // batismo | casamento | apresentacao_crianca | memorial | outro
  title: text("title").notNull(),
  eventId: uuid("event_id").references(() => events.id, {
    onDelete: "set null",
  }),
  requestedByText: text("requested_by_text"),
  responsibleUserId: text("responsible_user_id").references(() => user.id, {
    onDelete: "set null",
  }),
  scheduledAt: timestamp("scheduled_at"),
  status: text("status").notNull().default("solicitada"), // solicitada | em_preparacao | confirmada | realizada | cancelada
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

export const ceremonyParticipants = pgTable(
  "ceremony_participants",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ceremonyId: uuid("ceremony_id")
      .notNull()
      .references(() => ceremonies.id, { onDelete: "cascade" }),
    memberId: uuid("member_id").references(() => members.id, {
      onDelete: "set null",
    }),
    personName: text("person_name").notNull(),
    roleInCeremony: text("role_in_ceremony").notNull(), // batizando | noivo | noiva | crianca | pai | mae | familiar | outro
    birthDate: date("birth_date"),
    preparationDone: boolean("preparation_done").notNull().default(false),
    notes: text("notes"),
  },
  (table) => [
    unique("ceremony_participants_unique").on(
      table.ceremonyId,
      table.personName,
      table.roleInCeremony
    ),
  ]
);
