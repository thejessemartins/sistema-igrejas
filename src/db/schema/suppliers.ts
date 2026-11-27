import {
  boolean,
  date,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const suppliers = pgTable("suppliers", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  documentText: text("document_text"),
  contactName: text("contact_name"),
  phone: text("phone"),
  email: text("email"),
  categoryText: text("category_text"),
  addressText: text("address_text"),
  notes: text("notes"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

export const supplierContracts = pgTable("supplier_contracts", {
  id: uuid("id").defaultRandom().primaryKey(),
  supplierId: uuid("supplier_id")
    .notNull()
    .references(() => suppliers.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  startsAt: date("starts_at").notNull(),
  endsAt: date("ends_at"),
  monthlyValueCents: integer("monthly_value_cents"),
  status: text("status").notNull().default("ativo"), // ativo | encerrado | cancelado
  filePath: text("file_path"),
  renewalAlertDays: integer("renewal_alert_days").notNull().default(30),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});
