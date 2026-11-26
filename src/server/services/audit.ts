import { db } from "@/db";
import { auditLogs } from "@/db/schema";

interface LogAuditInput {
  userId?: string | null;
  acao: string;
  entidade: string;
  entidadeId?: string | null;
  detalhes?: Record<string, unknown>;
}

export async function logAudit({
  userId,
  acao,
  entidade,
  entidadeId,
  detalhes,
}: LogAuditInput): Promise<void> {
  await db.insert(auditLogs).values({
    userId: userId ?? null,
    acao,
    entidade,
    entidadeId: entidadeId ?? null,
    detalhes: detalhes ?? null,
  });
}
