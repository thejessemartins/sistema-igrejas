import {
  date,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { members } from "./members";

export const assets = pgTable("assets", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(), // som | instrumento | moveis | informatica | veiculo | cozinha | outro
  patrimonyCode: text("patrimony_code").notNull().unique(),
  description: text("description"),
  locationText: text("location_text"),
  responsibleMemberId: uuid("responsible_member_id").references(
    () => members.id,
    { onDelete: "set null" }
  ),
  acquiredAt: date("acquired_at"),
  acquisitionValueCents: integer("acquisition_value_cents"),
  condition: text("condition").notNull().default("bom"), // novo | bom | regular | ruim | baixado
  photoPath: text("photo_path"),
  invoicePath: text("invoice_path"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

export const assetMovements = pgTable("asset_movements", {
  id: uuid("id").defaultRandom().primaryKey(),
  assetId: uuid("asset_id")
    .notNull()
    .references(() => assets.id, { onDelete: "cascade" }),
  kind: text("kind").notNull(), // criacao | transferencia_local | manutencao | emprestimo | devolucao | baixa
  fromLocation: text("from_location"),
  toLocation: text("to_location"),
  memberId: uuid("member_id").references(() => members.id, {
    onDelete: "set null",
  }),
  notes: text("notes"),
  createdBy: text("created_by").references(() => user.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
