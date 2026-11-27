import {
  date,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { financialCategories, financialTransactions } from "./finance";
import { members } from "./members";

export const recurringCommitments = pgTable("recurring_commitments", {
  id: uuid("id").defaultRandom().primaryKey(),
  memberId: uuid("member_id")
    .notNull()
    .references(() => members.id, { onDelete: "cascade" }),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => financialCategories.id, { onDelete: "restrict" }),
  amountCents: integer("amount_cents").notNull(),
  frequency: text("frequency").notNull(), // mensal | semanal
  dayOfMonth: integer("day_of_month"), // nullable (1..31)
  startsAt: date("starts_at").notNull(),
  endsAt: date("ends_at"),
  status: text("status").notNull().default("ativo"), // ativo | pausado | encerrado
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

export const recurringOccurrences = pgTable(
  "recurring_occurrences",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    commitmentId: uuid("commitment_id")
      .notNull()
      .references(() => recurringCommitments.id, { onDelete: "cascade" }),
    dueDate: date("due_date").notNull(),
    financialTransactionId: uuid("financial_transaction_id").references(
      () => financialTransactions.id,
      { onDelete: "set null" }
    ),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    unique("recurring_occurrences_commitment_due_unique").on(
      table.commitmentId,
      table.dueDate
    ),
  ]
);
