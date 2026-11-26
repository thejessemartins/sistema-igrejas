import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";
import { members } from "./members";
import { user } from "./auth";

export const visitors = pgTable(
  "visitors",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    fullName: text("full_name").notNull(),
    phone: text("phone"),
    email: text("email"),
    invitedByMemberId: uuid("invited_by_member_id").references(() => members.id, {
      onDelete: "set null",
    }),
    invitedByText: text("invited_by_text"),
    firstVisitAt: timestamp("first_visit_at").notNull().defaultNow(),
    followUpStatus: text("follow_up_status").notNull().default("novo"),
    responsibleUserId: text("responsible_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    notes: text("notes"),
    convertedMemberId: uuid("converted_member_id").references(() => members.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => [
    index("visitors_full_name_idx").on(table.fullName),
    index("visitors_follow_up_status_idx").on(table.followUpStatus),
    index("visitors_first_visit_at_idx").on(table.firstVisitAt),
  ]
);

export const visitorVisits = pgTable("visitor_visits", {
  id: uuid("id").defaultRandom().primaryKey(),
  visitorId: uuid("visitor_id")
    .notNull()
    .references(() => visitors.id, { onDelete: "cascade" }),
  eventId: uuid("event_id"), // FK real será adicionada no Prompt 5
  visitedAt: timestamp("visited_at").notNull().defaultNow(),
  notes: text("notes"),
});
