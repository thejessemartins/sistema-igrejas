import { and, desc, eq, ilike, isNull } from "drizzle-orm";
import { db } from "@/db";
import { documents, documentVersions } from "@/db/schema";
import { canViewDocument } from "@/lib/document-access";

export async function getVisibleDocuments(
  role: string | null | undefined,
  category?: string,
  search?: string
) {
  const conditions = [isNull(documents.deletedAt)];
  if (category && category !== "todas") {
    conditions.push(eq(documents.category, category));
  }
  if (search && search.trim().length > 0) {
    conditions.push(ilike(documents.title, `%${search.trim()}%`));
  }

  const rows = await db
    .select({
      id: documents.id,
      title: documents.title,
      category: documents.category,
      description: documents.description,
      visibility: documents.visibility,
      currentVersion: documents.currentVersion,
      updatedAt: documents.updatedAt,
    })
    .from(documents)
    .where(and(...conditions))
    .orderBy(desc(documents.updatedAt));

  return rows.filter((doc) => canViewDocument(role, doc.visibility));
}

export async function getDocumentWithVersions(
  id: string,
  role: string | null | undefined
) {
  const [doc] = await db
    .select()
    .from(documents)
    .where(and(eq(documents.id, id), isNull(documents.deletedAt)))
    .limit(1);

  if (!doc || !canViewDocument(role, doc.visibility)) {
    return null;
  }

  const versions = await db
    .select()
    .from(documentVersions)
    .where(eq(documentVersions.documentId, id))
    .orderBy(desc(documentVersions.versionNumber));

  return { doc, versions };
}
