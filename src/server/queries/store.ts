import { asc, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { storeProducts, storeSaleItems, storeSales, user } from "@/db/schema";

export async function getStoreProducts(onlyActive = false) {
  const rows = await db
    .select()
    .from(storeProducts)
    .where(isNull(storeProducts.deletedAt))
    .orderBy(asc(storeProducts.name));

  return onlyActive ? rows.filter((p) => p.isActive) : rows;
}

export async function getStoreSales() {
  const sales = await db
    .select({
      id: storeSales.id,
      soldAt: storeSales.soldAt,
      sellerName: user.name,
      buyerText: storeSales.buyerText,
      paymentMethod: storeSales.paymentMethod,
      totalCents: storeSales.totalCents,
      financialTransactionId: storeSales.financialTransactionId,
      status: storeSales.status,
    })
    .from(storeSales)
    .innerJoin(user, eq(storeSales.sellerUserId, user.id))
    .orderBy(desc(storeSales.soldAt));

  const items = await db.select().from(storeSaleItems);
  const itemsBySale = new Map<string, typeof items>();
  for (const it of items) {
    const arr = itemsBySale.get(it.saleId) ?? [];
    arr.push(it);
    itemsBySale.set(it.saleId, arr);
  }

  return sales.map((s) => ({
    ...s,
    items: itemsBySale.get(s.id) ?? [],
  }));
}
