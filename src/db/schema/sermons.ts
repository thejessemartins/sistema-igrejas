import {
  boolean,
  date,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { events } from "./events";
import { members } from "./members";

export const sermons = pgTable("sermons", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  preacherText: text("preacher_text"),
  preacherMemberId: uuid("preacher_member_id").references(() => members.id, {
    onDelete: "set null",
  }),
  eventId: uuid("event_id").references(() => events.id, {
    onDelete: "set null",
  }),
  preachedAt: date("preached_at").notNull(),
  bibleReference: text("bible_reference"),
  seriesName: text("series_name"),
  summary: text("summary"),
  tags: text("tags"),
  audioPath: text("audio_path"),
  videoPath: text("video_path"),
  pdfPath: text("pdf_path"),
  notesPath: text("notes_path"),
  isPublished: boolean("is_published").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});
