import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";
import { members } from "./members";
import { user } from "./auth";

export const events = pgTable(
  "events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    eventType: text("event_type").notNull(),
    startsAt: timestamp("starts_at").notNull(),
    endsAt: timestamp("ends_at"),
    location: text("location"),
    theme: text("theme"),
    preacherText: text("preacher_text"),
    preacherMemberId: uuid("preacher_member_id").references(() => members.id, {
      onDelete: "set null",
    }),
    responsibleUserId: text("responsible_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    description: text("description"),
    status: text("status").notNull().default("agendado"),
    cancelReason: text("cancel_reason"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => [
    index("events_starts_at_idx").on(table.startsAt),
    index("events_status_idx").on(table.status),
    index("events_event_type_idx").on(table.eventType),
  ]
);
