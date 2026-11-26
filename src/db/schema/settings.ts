import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const churchSettings = pgTable("church_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  churchName: text("church_name").notNull().default("Igreja Local"),
  legalName: text("legal_name"),
  cnpj: text("cnpj"),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  logoPath: text("logo_path"),
  defaultCurrency: text("default_currency").notNull().default("BRL"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
