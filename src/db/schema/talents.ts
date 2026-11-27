import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { members } from "./members";

export const skillTags = pgTable("skill_tags", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
  category: text("category").notNull(), // musica | tecnica | manual | ensino | cuidado | administracao | outro
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const memberSkills = pgTable(
  "member_skills",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    memberId: uuid("member_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    skillTagId: uuid("skill_tag_id")
      .notNull()
      .references(() => skillTags.id, { onDelete: "cascade" }),
    level: text("level").notNull().default("intermediario"), // iniciante | intermediario | avancado
    notes: text("notes"),
  },
  (table) => [
    unique("member_skills_member_tag_unique").on(
      table.memberId,
      table.skillTagId
    ),
  ]
);

export const memberAvailability = pgTable(
  "member_availability",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    memberId: uuid("member_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    weekday: integer("weekday").notNull(), // 0-6
    period: text("period").notNull(), // manha | tarde | noite
  },
  (table) => [
    unique("member_availability_member_day_period_unique").on(
      table.memberId,
      table.weekday,
      table.period
    ),
  ]
);
