import {
  integer,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { financialCategories } from "./finance";

export const budgetItems = pgTable(
  "budget_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    year: integer("year").notNull(),
    month: integer("month").notNull(),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => financialCategories.id, { onDelete: "cascade" }),
    plannedInCents: integer("planned_in_cents").notNull().default(0),
    plannedOutCents: integer("planned_out_cents").notNull().default(0),
    notes: text("notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    unique("budget_items_unique").on(table.year, table.month, table.categoryId),
  ]
);
