import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  date,
  unique,
} from "drizzle-orm/pg-core";
import { members } from "./members";
import { user } from "./auth";

export const cells = pgTable("cells", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  leaderMemberId: uuid("leader_member_id")
    .notNull()
    .references(() => members.id, { onDelete: "restrict" }),
  coLeaderMemberId: uuid("co_leader_member_id").references(() => members.id, {
    onDelete: "set null",
  }),
  weekday: integer("weekday").notNull(), // 0-6 (Domingo=0 .. Sábado=6)
  meetingTime: text("meeting_time").notNull(), // HH:mm
  addressStreet: text("address_street"),
  addressDistrict: text("address_district"),
  addressCity: text("address_city"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

export const cellMembers = pgTable("cell_members", {
  id: uuid("id").defaultRandom().primaryKey(),
  cellId: uuid("cell_id")
    .notNull()
    .references(() => cells.id, { onDelete: "cascade" }),
  memberId: uuid("member_id")
    .notNull()
    .references(() => members.id, { onDelete: "cascade" }),
  joinedAt: date("joined_at").notNull(),
  leftAt: date("left_at"),
});

export const cellMeetings = pgTable("cell_meetings", {
  id: uuid("id").defaultRandom().primaryKey(),
  cellId: uuid("cell_id")
    .notNull()
    .references(() => cells.id, { onDelete: "cascade" }),
  meetingDate: date("meeting_date").notNull(),
  topic: text("topic").notNull(),
  notes: text("notes"),
  createdBy: text("created_by").references(() => user.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

export const cellMeetingAttendance = pgTable(
  "cell_meeting_attendance",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    cellMeetingId: uuid("cell_meeting_id")
      .notNull()
      .references(() => cellMeetings.id, { onDelete: "cascade" }),
    memberId: uuid("member_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("presente"), // presente | ausente | justificado
  },
  (table) => [
    unique("cell_meeting_attendance_unique").on(
      table.cellMeetingId,
      table.memberId
    ),
  ]
);
