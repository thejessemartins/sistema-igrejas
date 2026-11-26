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
import { user } from "./auth";
import { events } from "./events";
import { members } from "./members";

export const financialCategories = pgTable("financial_categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  kind: text("kind").notNull(), // receita | despesa
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

export const financialTransactions = pgTable("financial_transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  kind: text("kind").notNull(), // receita | despesa
  categoryId: uuid("category_id")
    .notNull()
    .references(() => financialCategories.id, { onDelete: "restrict" }),
  memberId: uuid("member_id").references(() => members.id, {
    onDelete: "set null",
  }),
  isAnonymous: boolean("is_anonymous").notNull().default(false),
  visitorNameText: text("visitor_name_text"),
  description: text("description").notNull(),
  amountCents: integer("amount_cents").notNull(),
  transactionDate: date("transaction_date").notNull(),
  paymentMethod: text("payment_method").notNull(),
  eventId: uuid("event_id").references(() => events.id, {
    onDelete: "set null",
  }),
  supplierText: text("supplier_text"),
  dueDate: date("due_date"),
  paidAt: date("paid_at"),
  attachmentPath: text("attachment_path"),
  reversedOfId: uuid("reversed_of_id"),
  createdBy: text("created_by").references(() => user.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

export const monthlyClosings = pgTable(
  "monthly_closings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    year: integer("year").notNull(),
    month: integer("month").notNull(),
    totalInCents: integer("total_in_cents").notNull(),
    totalOutCents: integer("total_out_cents").notNull(),
    balanceCents: integer("balance_cents").notNull(),
    closedBy: text("closed_by").references(() => user.id, {
      onDelete: "set null",
    }),
    closedAt: timestamp("closed_at").notNull().defaultNow(),
    reopenedBy: text("reopened_by").references(() => user.id, {
      onDelete: "set null",
    }),
    reopenedAt: timestamp("reopened_at"),
    reopenReason: text("reopen_reason"),
  },
  (table) => [unique("monthly_closings_year_month_unique").on(table.year, table.month)]
);
