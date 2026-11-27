import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { members } from "./members";

export const journeyStages = pgTable("journey_stages", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  position: integer("position").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const memberJourney = pgTable("member_journey", {
  id: uuid("id").defaultRandom().primaryKey(),
  memberId: uuid("member_id")
    .notNull()
    .references(() => members.id, { onDelete: "cascade" }),
  stageId: uuid("stage_id")
    .notNull()
    .references(() => journeyStages.id, { onDelete: "cascade" }),
  enteredAt: timestamp("entered_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
  responsibleUserId: text("responsible_user_id").references(() => user.id, {
    onDelete: "set null",
  }),
  notes: text("notes"),
});
