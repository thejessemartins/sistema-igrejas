import { and, desc, eq, gte, lte } from "drizzle-orm";
import { db } from "@/db";
import { auditLogs, user } from "@/db/schema";
import { requirePermission } from "@/lib/session";

export interface ListAuditFilters {
  userId?: string;
  acao?: string;
  startDate?: string;
  endDate?: string;
}

export async function listAuditLogs(filters: ListAuditFilters = {}) {
  await requirePermission("auditoria", "ver");

  const conditions = [];

  if (filters.userId && filters.userId !== "all") {
    conditions.push(eq(auditLogs.userId, filters.userId));
  }

  if (filters.acao && filters.acao !== "all") {
    conditions.push(eq(auditLogs.acao, filters.acao));
  }

  if (filters.startDate) {
    conditions.push(gte(auditLogs.createdAt, new Date(filters.startDate)));
  }

  if (filters.endDate) {
    const end = new Date(filters.endDate);
    end.setHours(23, 59, 59, 999);
    conditions.push(lte(auditLogs.createdAt, end));
  }

  return db
    .select({
      id: auditLogs.id,
      userId: auditLogs.userId,
      userName: user.name,
      userEmail: user.email,
      acao: auditLogs.acao,
      entidade: auditLogs.entidade,
      entidadeId: auditLogs.entidadeId,
      detalhes: auditLogs.detalhes,
      createdAt: auditLogs.createdAt,
    })
    .from(auditLogs)
    .leftJoin(user, eq(auditLogs.userId, user.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(auditLogs.createdAt))
    .limit(200);
}
