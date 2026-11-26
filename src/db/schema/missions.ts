import {
  boolean,
  date,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { financialTransactions } from "./finance";
import { members } from "./members";

export const socialProjects = pgTable("social_projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  kind: text("kind").notNull(), // missoes | acao_social | campanha
  startsAt: date("starts_at").notNull(),
  endsAt: date("ends_at"),
  goalCents: integer("goal_cents"),
  responsibleMemberId: uuid("responsible_member_id").references(
    () => members.id,
    { onDelete: "set null" }
  ),
  status: text("status").notNull().default("ativo"), // planejado | ativo | encerrado
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

export const aidBeneficiaries = pgTable("aid_beneficiaries", {
  id: uuid("id").defaultRandom().primaryKey(),
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  addressDistrict: text("address_district"),
  familySize: integer("family_size").notNull().default(1),
  notes: text("notes"),
  isMember: boolean("is_member").notNull().default(false),
  memberId: uuid("member_id").references(() => members.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

export const itemDonations = pgTable("item_donations", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => socialProjects.id, { onDelete: "cascade" }),
  donorMemberId: uuid("donor_member_id").references(() => members.id, {
    onDelete: "set null",
  }),
  donorText: text("donor_text"),
  itemDescription: text("item_description").notNull(),
  quantity: integer("quantity").notNull().default(1),
  unit: text("unit").notNull().default("un"),
  donatedAt: date("donated_at").notNull(),
  deliveredAt: date("delivered_at"),
  beneficiaryId: uuid("beneficiary_id").references(() => aidBeneficiaries.id, {
    onDelete: "set null",
  }),
  financialTransactionId: uuid("financial_transaction_id").references(
    () => financialTransactions.id,
    { onDelete: "set null" }
  ),
  createdBy: text("created_by").references(() => user.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
