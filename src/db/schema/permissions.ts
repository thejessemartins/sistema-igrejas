import { boolean, pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";

export const rolePermissions = pgTable(
  "role_permissions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    role: text("role").notNull(),
    module: text("module").notNull(),
    action: text("action").notNull(),
    allowed: boolean("allowed").notNull(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    unique("role_permissions_role_mod_act_unique").on(
      table.role,
      table.module,
      table.action
    ),
  ]
);
