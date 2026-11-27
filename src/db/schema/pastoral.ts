import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { members } from "./members";

export const pastoralAppointments = pgTable("pastoral_appointments", {
  id: uuid("id").defaultRandom().primaryKey(),
  pastorUserId: text("pastor_user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  memberId: uuid("member_id").references(() => members.id, {
    onDelete: "set null",
  }),
  personName: text("person_name").notNull(),
  phone: text("phone"),
  reasonCategory: text("reason_category").notNull(), // aconselhamento | oracao | familia | luto | visita | outro
  startsAt: timestamp("starts_at").notNull(),
  endsAt: timestamp("ends_at").notNull(),
  placeText: text("place_text"),
  status: text("status").notNull().default("solicitado"), // solicitado | confirmado | realizado | cancelado | faltou
  cancelReason: text("cancel_reason"),
  createdBy: text("created_by").references(() => user.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

export const pastoralNotes = pgTable("pastoral_notes", {
  id: uuid("id").defaultRandom().primaryKey(),
  appointmentId: uuid("appointment_id")
    .notNull()
    .unique()
    .references(() => pastoralAppointments.id, { onDelete: "cascade" }),
  pastorUserId: text("pastor_user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
