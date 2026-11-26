import {
  pgTable,
  uuid,
  text,
  date,
  timestamp,
  index,
  unique,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const members = pgTable(
  "members",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    fullName: text("full_name").notNull(),
    birthDate: date("birth_date"),
    cpf: text("cpf").unique(),
    phone: text("phone"),
    email: text("email"),
    addressStreet: text("address_street"),
    addressNumber: text("address_number"),
    addressComplement: text("address_complement"),
    addressDistrict: text("address_district"),
    addressCity: text("address_city"),
    addressState: text("address_state"),
    addressZip: text("address_zip"),
    maritalStatus: text("marital_status"),
    baptismDate: date("baptism_date"),
    joinedAt: date("joined_at"),
    photoPath: text("photo_path"),
    status: text("status").notNull().default("ativo"),
    notes: text("notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => [
    index("members_full_name_idx").on(table.fullName),
    index("members_cpf_idx").on(table.cpf),
    index("members_status_idx").on(table.status),
    index("members_birth_date_idx").on(table.birthDate),
  ]
);

export const memberFamilyLinks = pgTable(
  "member_family_links",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    memberId: uuid("member_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    relatedMemberId: uuid("related_member_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    relation: text("relation").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    unique("member_family_links_pair_unique").on(
      table.memberId,
      table.relatedMemberId
    ),
  ]
);

export const memberHistory = pgTable("member_history", {
  id: uuid("id").defaultRandom().primaryKey(),
  memberId: uuid("member_id")
    .notNull()
    .references(() => members.id, { onDelete: "cascade" }),
  field: text("field").notNull(),
  oldValue: text("old_value"),
  newValue: text("new_value"),
  changedBy: text("changed_by").references(() => user.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
