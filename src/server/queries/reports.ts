import { and, count, desc, eq, isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  cellMeetings,
  cells,
  financialCategories,
  financialTransactions,
  members,
  ministries,
  scheduleAssignments,
  visitors,
} from "@/db/schema";
import { hasPermission } from "@/lib/permissions";
import { requirePermission, type AppSession } from "@/lib/session";

export type ReportType =
  | "membros"
  | "visitantes"
  | "celulas"
  | "escalas"
  | "financeiro";

export async function getReportData(type: ReportType, session: AppSession) {
  await requirePermission("relatorios", "ver");

  if (type === "financeiro" && !hasPermission(session, "financeiro", "ver")) {
    throw new Error("Acesso negado ao relatório financeiro.");
  }

  if (type === "membros") {
    const rows = await db
      .select({
        status: members.status,
        total: count(),
      })
      .from(members)
      .where(isNull(members.deletedAt))
      .groupBy(members.status);
    return {
      headers: ["Status", "Quantidade"],
      rows: rows.map((r) => [r.status, String(r.total)]),
    };
  }

  if (type === "visitantes") {
    const rows = await db
      .select({
        status: visitors.followUpStatus,
        total: count(),
      })
      .from(visitors)
      .where(isNull(visitors.deletedAt))
      .groupBy(visitors.followUpStatus);
    return {
      headers: ["Status de Acompanhamento", "Quantidade"],
      rows: rows.map((r) => [r.status, String(r.total)]),
    };
  }

  if (type === "celulas") {
    const rows = await db
      .select({
        cellName: cells.name,
        meetingsCount: count(cellMeetings.id),
      })
      .from(cells)
      .leftJoin(cellMeetings, eq(cells.id, cellMeetings.cellId))
      .where(isNull(cells.deletedAt))
      .groupBy(cells.id, cells.name);
    return {
      headers: ["Célula", "Reuniões Realizadas"],
      rows: rows.map((r) => [r.cellName, String(r.meetingsCount)]),
    };
  }

  if (type === "escalas") {
    const rows = await db
      .select({
        memberName: members.fullName,
        total: count(scheduleAssignments.id),
      })
      .from(scheduleAssignments)
      .innerJoin(members, eq(scheduleAssignments.memberId, members.id))
      .groupBy(members.id, members.fullName)
      .orderBy(desc(count(scheduleAssignments.id)))
      .limit(50);
    return {
      headers: ["Voluntário", "Designações"],
      rows: rows.map((r) => [r.memberName, String(r.total)]),
    };
  }

  // financeiro
  const rows = await db
    .select({
      categoryName: financialCategories.name,
      kind: financialTransactions.kind,
      totalCents: sql<number>`coalesce(sum(${financialTransactions.amountCents}), 0)::int`,
    })
    .from(financialTransactions)
    .innerJoin(
      financialCategories,
      eq(financialTransactions.categoryId, financialCategories.id)
    )
    .where(isNull(financialTransactions.deletedAt))
    .groupBy(financialCategories.name, financialTransactions.kind);

  return {
    headers: ["Categoria", "Tipo", "Total (BRL)"],
    rows: rows.map((r) => [
      r.categoryName,
      r.kind,
      (r.totalCents / 100).toFixed(2).replace(".", ","),
    ]),
  };
}
