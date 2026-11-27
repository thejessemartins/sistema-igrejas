import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { financialTransactions } from "./finance";
import { members } from "./members";

export const storeProducts = pgTable("store_products", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  priceCents: integer("price_cents").notNull(),
  stockQuantity: integer("stock_quantity").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  photoPath: text("photo_path"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

export const storeSales = pgTable("store_sales", {
  id: uuid("id").defaultRandom().primaryKey(),
  soldAt: timestamp("sold_at").notNull().defaultNow(),
  sellerUserId: text("seller_user_id")
    .notNull()
    .references(() => user.id, { onDelete: "restrict" }),
  buyerMemberId: uuid("buyer_member_id").references(() => members.id, {
    onDelete: "set null",
  }),
  buyerText: text("buyer_text"),
  paymentMethod: text("payment_method").notNull(), // dinheiro | transferencia_manual | cartao_manual
  totalCents: integer("total_cents").notNull(),
  financialTransactionId: uuid("financial_transaction_id").references(
    () => financialTransactions.id,
    { onDelete: "set null" }
  ),
  status: text("status").notNull().default("concluida"), // concluida | cancelada
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const storeSaleItems = pgTable("store_sale_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  saleId: uuid("sale_id")
    .notNull()
    .references(() => storeSales.id, { onDelete: "cascade" }),
  productId: uuid("product_id")
    .notNull()
    .references(() => storeProducts.id, { onDelete: "restrict" }),
  productNameSnapshot: text("product_name_snapshot").notNull(),
  unitPriceCentsSnapshot: integer("unit_price_cents_snapshot").notNull(),
  quantity: integer("quantity").notNull(),
});
