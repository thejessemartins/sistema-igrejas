import {
  integer,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { events } from "./events";
import { ministries } from "./ministries";

export const worshipSongs = pgTable("worship_songs", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  authorText: text("author_text"),
  musicalKey: text("musical_key"),
  tempoBpm: integer("tempo_bpm"),
  themeTags: text("theme_tags"),
  lyricsText: text("lyrics_text"),
  chordSheetPath: text("chord_sheet_path"),
  linkNote: text("link_note"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

export const worshipSetlists = pgTable("worship_setlists", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventId: uuid("event_id")
    .notNull()
    .unique()
    .references(() => events.id, { onDelete: "cascade" }),
  ministryId: uuid("ministry_id").references(() => ministries.id, {
    onDelete: "set null",
  }),
  title: text("title").notNull(),
  notes: text("notes"),
  createdBy: text("created_by").references(() => user.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const worshipSetlistItems = pgTable(
  "worship_setlist_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    setlistId: uuid("setlist_id")
      .notNull()
      .references(() => worshipSetlists.id, { onDelete: "cascade" }),
    songId: uuid("song_id")
      .notNull()
      .references(() => worshipSongs.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    musicalKeyOverride: text("musical_key_override"),
    notes: text("notes"),
  },
  (table) => [
    unique("worship_setlist_items_pos_unique").on(
      table.setlistId,
      table.position
    ),
    unique("worship_setlist_items_song_unique").on(
      table.setlistId,
      table.songId
    ),
  ]
);
