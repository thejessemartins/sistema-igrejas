import { asc, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import {
  financialTransactions,
  supplierContracts,
  suppliers,
} from "@/db/schema";

export async function getSuppliersDashboard() {
  const [suppliersList, contractsList, expenses] = await Promise.all([
    db
      .select()
      .from(suppliers)
      .where(isNull(suppliers.deletedAt))
      .orderBy(asc(suppliers.name)),
    db
      .select({
        id: supplierContracts.id,
        supplierId: supplierContracts.supplierId,
        supplierName: suppliers.name,
        title: supplierContracts.title,
        startsAt: supplierContracts.startsAt,
        endsAt: supplierContracts.endsAt,
        monthlyValueCents: supplierContracts.monthlyValueCents,
        status: supplierContracts.status,
        renewalAlertDays: supplierContracts.renewalAlertDays,
      })
      .from(supplierContracts)
      .innerJoin(suppliers, eq(supplierContracts.supplierId, suppliers.id))
      .where(isNull(supplierContracts.deletedAt))
      .orderBy(desc(supplierContracts.createdAt)),
    db
      .select({
        supplierId: financialTransactions.supplierId,
        amountCents: financialTransactions.amountCents,
      })
      .from(financialTransactions)
      .where(isNull(financialTransactions.deletedAt)),
  ]);

  const paidBySupplier = new Map<string, number>();
  for (const e of expenses) {
    if (e.supplierId) {
      paidBySupplier.set(
        e.supplierId,
        (paidBySupplier.get(e.supplierId) ?? 0) + e.amountCents
      );
    }
  }

  const now = new Date();
  const expiringContracts = contractsList.filter((c) => {
    if (c.status !== "ativo" || !c.endsAt) return false;
    const end = new Date(`${c.endsAt}T12:00:00`);
    const diffDays = (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= c.renewalAlertDays;
  });

  return {
    suppliers: suppliersList.map((s) => ({
      ...s,
      totalPaidCents: paidBySupplier.get(s.id) ?? 0,
    })),
    contracts: contractsList,
    expiringContracts,
  };
}
