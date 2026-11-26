import {
  boolean,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { cells } from "./cells";
import { ministries } from "./ministries";

export const notices = pgTable("notices", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  audienceType: text("audience_type").notNull().default("todos"), // todos | ministerio | celula | papeis
  ministryId: uuid("ministry_id").references(() => ministries.id, {
    onDelete: "set null",
  }),
  cellId: uuid("cell_id").references(() => cells.id, {
    onDelete: "set null",
  }),
  priority: text("priority").notNull().default("normal"), // normal | importante | urgente
  publishAt: timestamp("publish_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at"),
  isPinned: boolean("is_pinned").notNull().default(false),
  authorUserId: text("author_user_id").references(() => user.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

export const noticeReads = pgTable(
  "notice_reads",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    noticeId: uuid("notice_id")
      .notNull()
      .references(() => notices.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    readAt: timestamp("read_at").notNull().defaultNow(),
  },
  (table) => [unique("notice_reads_unique").on(table.noticeId, table.userId)]
);
