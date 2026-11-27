import {
  integer,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const documents = pgTable("documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull(), // ata | estatuto | regimento | financeiro | juridico | outro
  description: text("description"),
  visibility: text("visibility").notNull().default("todos_logados"), // todos_logados | lideranca | pastoral_financeiro | admin
  currentVersion: integer("current_version").notNull().default(1),
  createdBy: text("created_by").references(() => user.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

export const documentVersions = pgTable(
  "document_versions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    documentId: uuid("document_id")
      .notNull()
      .references(() => documents.id, { onDelete: "cascade" }),
    versionNumber: integer("version_number").notNull(),
    filePath: text("file_path").notNull(),
    fileSizeBytes: integer("file_size_bytes").notNull(),
    changeNotes: text("change_notes"),
    uploadedBy: text("uploaded_by").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    unique("document_versions_doc_ver_unique").on(
      table.documentId,
      table.versionNumber
    ),
  ]
);
