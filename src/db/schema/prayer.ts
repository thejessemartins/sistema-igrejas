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
import { members } from "./members";

export const prayerRequests = pgTable("prayer_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  authorUserId: text("author_user_id").references(() => user.id, {
    onDelete: "set null",
  }),
  authorMemberId: uuid("author_member_id").references(() => members.id, {
    onDelete: "set null",
  }),
  authorText: text("author_text"),
  title: text("title").notNull(),
  body: text("body").notNull(),
  visibility: text("visibility").notNull().default("publico"), // publico | intercessores | pastoral
  isAnonymous: boolean("is_anonymous").notNull().default(false),
  status: text("status").notNull().default("ativo"), // ativo | atendido | arquivado
  answeredNotes: text("answered_notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

export const prayerCommitments = pgTable(
  "prayer_commitments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    prayerRequestId: uuid("prayer_request_id")
      .notNull()
      .references(() => prayerRequests.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    prayedDay: date("prayed_day").notNull(),
    prayedAt: timestamp("prayed_at").notNull().defaultNow(),
  },
  (table) => [
    unique("prayer_commitments_unique").on(
      table.prayerRequestId,
      table.userId,
      table.prayedDay
    ),
  ]
);
