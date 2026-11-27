import {
  boolean,
  date,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { members } from "./members";

export const courses = pgTable("courses", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  kind: text("kind").notNull(), // ebd | curso_livre | classe_integracao | treinamento_lideranca
  teacherMemberId: uuid("teacher_member_id").references(() => members.id, {
    onDelete: "set null",
  }),
  startsAt: date("starts_at").notNull(),
  endsAt: date("ends_at"),
  weekday: integer("weekday").notNull().default(0),
  meetingTime: text("meeting_time"),
  roomText: text("room_text"),
  capacity: integer("capacity"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

export const courseEnrollments = pgTable(
  "course_enrollments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    memberId: uuid("member_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    enrolledAt: timestamp("enrolled_at").notNull().defaultNow(),
    status: text("status").notNull().default("ativo"), // ativo | concluido | desistente
    completionNotes: text("completion_notes"),
  },
  (table) => [
    unique("course_enrollments_course_member_unique").on(
      table.courseId,
      table.memberId
    ),
  ]
);

export const courseLessons = pgTable("course_lessons", {
  id: uuid("id").defaultRandom().primaryKey(),
  courseId: uuid("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  lessonDate: date("lesson_date").notNull(),
  title: text("title").notNull(),
  summary: text("summary"),
  materialPath: text("material_path"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const courseAttendance = pgTable(
  "course_attendance",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    lessonId: uuid("lesson_id")
      .notNull()
      .references(() => courseLessons.id, { onDelete: "cascade" }),
    memberId: uuid("member_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("presente"), // presente | ausente | justificado
  },
  (table) => [
    unique("course_attendance_lesson_member_unique").on(
      table.lessonId,
      table.memberId
    ),
  ]
);
