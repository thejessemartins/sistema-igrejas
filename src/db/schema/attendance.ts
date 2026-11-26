import { sql } from "drizzle-orm";
import {
  check,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { events } from "./events";
import { members } from "./members";
import { visitors } from "./visitors";

export const attendances = pgTable(
  "attendances",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    memberId: uuid("member_id").references(() => members.id, {
      onDelete: "cascade",
    }),
    visitorId: uuid("visitor_id").references(() => visitors.id, {
      onDelete: "cascade",
    }),
    personNameSnapshot: text("person_name_snapshot").notNull(),
    status: text("status").notNull().default("presente"), // presente | ausente | justificado
    checkedAt: timestamp("checked_at").notNull().defaultNow(),
    checkedBy: text("checked_by").references(() => user.id, {
      onDelete: "set null",
    }),
    notes: text("notes"),
  },
  (table) => [
    unique("attendances_event_member_unique").on(table.eventId, table.memberId),
    unique("attendances_event_visitor_unique").on(
      table.eventId,
      table.visitorId
    ),
    check(
      "attendances_exactly_one_person_check",
      sql`(${table.memberId} IS NOT NULL AND ${table.visitorId} IS NULL) OR (${table.memberId} IS NULL AND ${table.visitorId} IS NOT NULL)`
    ),
  ]
);
