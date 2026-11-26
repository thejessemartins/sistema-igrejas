import {
  boolean,
  date,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { events } from "./events";
import { members } from "./members";

export const ministries = pgTable("ministries", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  leaderMemberId: uuid("leader_member_id").references(() => members.id, {
    onDelete: "set null",
  }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

export const ministryMembers = pgTable("ministry_members", {
  id: uuid("id").defaultRandom().primaryKey(),
  ministryId: uuid("ministry_id")
    .notNull()
    .references(() => ministries.id, { onDelete: "cascade" }),
  memberId: uuid("member_id")
    .notNull()
    .references(() => members.id, { onDelete: "cascade" }),
  roleInMinistry: text("role_in_ministry").notNull(),
  joinedAt: date("joined_at").notNull(),
  leftAt: date("left_at"),
});

export const schedules = pgTable("schedules", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventId: uuid("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  ministryId: uuid("ministry_id")
    .notNull()
    .references(() => ministries.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

export const scheduleAssignments = pgTable(
  "schedule_assignments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    scheduleId: uuid("schedule_id")
      .notNull()
      .references(() => schedules.id, { onDelete: "cascade" }),
    memberId: uuid("member_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    assignmentRole: text("assignment_role").notNull(),
    status: text("status").notNull().default("pendente"), // confirmado | pendente | substituido | cancelado
    replacedByMemberId: uuid("replaced_by_member_id").references(
      () => members.id,
      { onDelete: "set null" }
    ),
  },
  (table) => [
    unique("schedule_assignments_unique").on(
      table.scheduleId,
      table.memberId,
      table.assignmentRole
    ),
  ]
);
