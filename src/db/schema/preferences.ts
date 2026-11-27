import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const userPreferences = pgTable("user_preferences", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  fontSizeScale: text("font_size_scale").notNull().default("padrao"), // padrao | maior | muito_maior
  reduceMotion: boolean("reduce_motion").notNull().default(false),
  highContrastText: boolean("high_contrast_text").notNull().default(false),
  simplifiedLists: boolean("simplified_lists").notNull().default(false),
  locale: text("locale").notNull().default("pt-BR"), // pt-BR | es | en
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
