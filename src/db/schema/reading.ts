import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { members } from "./members";

export const readingPlans = pgTable("reading_plans", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  durationDays: integer("duration_days").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdBy: text("created_by").references(() => user.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

export const readingPlanDays = pgTable(
  "reading_plan_days",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    planId: uuid("plan_id")
      .notNull()
      .references(() => readingPlans.id, { onDelete: "cascade" }),
    dayNumber: integer("day_number").notNull(),
    bibleReference: text("bible_reference").notNull(),
    devotionalTitle: text("devotional_title").notNull(),
    devotionalBody: text("devotional_body"),
  },
  (table) => [
    unique("reading_plan_days_unique").on(table.planId, table.dayNumber),
  ]
);

export const readingProgress = pgTable(
  "reading_progress",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    memberId: uuid("member_id").references(() => members.id, {
      onDelete: "set null",
    }),
    planId: uuid("plan_id")
      .notNull()
      .references(() => readingPlans.id, { onDelete: "cascade" }),
    dayNumber: integer("day_number").notNull(),
    completedAt: timestamp("completed_at").notNull().defaultNow(),
  },
  (table) => [
    unique("reading_progress_unique").on(
      table.userId,
      table.planId,
      table.dayNumber
    ),
  ]
);
