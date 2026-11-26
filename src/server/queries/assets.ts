import { and, asc, desc, eq, ilike, isNull, or } from "drizzle-orm";
import { db } from "@/db";
import { assetMovements, assets, members } from "@/db/schema";
import { requirePermission } from "@/lib/session";

export async function getAssets(params: {
  search?: string;
  category?: string;
  condition?: string;
} = {}) {
  await requirePermission("membros", "ver");

  const conditions = [isNull(assets.deletedAt)];
  if (params.search?.trim()) {
    const term = `%${params.search.trim()}%`;
    conditions.push(
      or(ilike(assets.name, term), ilike(assets.patrimonyCode, term))!
    );
  }
  if (params.category && params.category !== "all") {
    conditions.push(eq(assets.category, params.category));
  }
  if (params.condition && params.condition !== "all") {
    conditions.push(eq(assets.condition, params.condition));
  }

  return db
    .select({
      id: assets.id,
      name: assets.name,
      category: assets.category,
      patrimonyCode: assets.patrimonyCode,
      locationText: assets.locationText,
      condition: assets.condition,
      acquisitionValueCents: assets.acquisitionValueCents,
    })
    .from(assets)
    .where(and(...conditions))
    .orderBy(asc(assets.patrimonyCode));
}

export async function getAssetById(id: string) {
  await requirePermission("membros", "ver");

  const [asset] = await db
    .select({
      id: assets.id,
      name: assets.name,
      category: assets.category,
      patrimonyCode: assets.patrimonyCode,
      description: assets.description,
      locationText: assets.locationText,
      responsibleMemberName: members.fullName,
      acquiredAt: assets.acquiredAt,
      acquisitionValueCents: assets.acquisitionValueCents,
      condition: assets.condition,
    })
    .from(assets)
    .leftJoin(members, eq(assets.responsibleMemberId, members.id))
    .where(and(eq(assets.id, id), isNull(assets.deletedAt)))
    .limit(1);

  if (!asset) return null;

  const movements = await db
    .select()
    .from(assetMovements)
    .where(eq(assetMovements.assetId, id))
    .orderBy(desc(assetMovements.createdAt));

  return { asset, movements };
}
