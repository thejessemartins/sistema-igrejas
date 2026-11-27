import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { cells } from "./cells";
import { ministries } from "./ministries";

export const surveys = pgTable("surveys", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  audienceType: text("audience_type").notNull().default("todos"), // todos | ministerio | celula | papeis
  ministryId: uuid("ministry_id").references(() => ministries.id, {
    onDelete: "set null",
  }),
  cellId: uuid("cell_id").references(() => cells.id, { onDelete: "set null" }),
  isAnonymous: boolean("is_anonymous").notNull().default(false),
  startsAt: timestamp("starts_at").notNull().defaultNow(),
  endsAt: timestamp("ends_at"),
  status: text("status").notNull().default("rascunho"), // rascunho | publicada | encerrada
  createdBy: text("created_by").references(() => user.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

export const surveyQuestions = pgTable("survey_questions", {
  id: uuid("id").defaultRandom().primaryKey(),
  surveyId: uuid("survey_id")
    .notNull()
    .references(() => surveys.id, { onDelete: "cascade" }),
  position: integer("position").notNull().default(0),
  questionText: text("question_text").notNull(),
  kind: text("kind").notNull(), // texto_curto | texto_longo | unica_escolha | multipla_escolha | nota_1_5 | sim_nao
  optionsJson: jsonb("options_json").$type<string[] | null>(),
  isRequired: boolean("is_required").notNull().default(true),
});

export const surveyResponses = pgTable("survey_responses", {
  id: uuid("id").defaultRandom().primaryKey(),
  surveyId: uuid("survey_id")
    .notNull()
    .references(() => surveys.id, { onDelete: "cascade" }),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
});

export const surveyAnswers = pgTable("survey_answers", {
  id: uuid("id").defaultRandom().primaryKey(),
  responseId: uuid("response_id")
    .notNull()
    .references(() => surveyResponses.id, { onDelete: "cascade" }),
  questionId: uuid("question_id")
    .notNull()
    .references(() => surveyQuestions.id, { onDelete: "cascade" }),
  valueText: text("value_text"),
  valuesJson: jsonb("values_json").$type<string[] | null>(),
});
