"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  cells,
  churchSettings,
  events,
  financialTransactions,
  members,
  ministries,
  notices,
  visitors,
} from "@/db/schema";
import { requirePermission } from "@/lib/session";
import { memberSchema } from "@/lib/validations";
import { logAudit } from "@/server/services/audit";
import type { ActionResult } from "./auth";

export async function getChurchSettings() {
  const [row] = await db.select().from(churchSettings).limit(1);
  return row ?? null;
}

export async function saveChurchSettings(input: {
  churchName: string;
  legalName?: string;
  cnpj?: string;
  email?: string;
  phone?: string;
  address?: string;
}): Promise<ActionResult> {
  const session = await requirePermission("permissoes", "editar");
  if (!input.churchName.trim()) {
    return { ok: false, error: "Nome da igreja é obrigatório." };
  }

  const [existing] = await db.select().from(churchSettings).limit(1);
  if (existing) {
    await db
      .update(churchSettings)
      .set({
        churchName: input.churchName.trim(),
        legalName: input.legalName?.trim() || null,
        cnpj: input.cnpj?.trim() || null,
        email: input.email?.trim() || null,
        phone: input.phone?.trim() || null,
        address: input.address?.trim() || null,
        updatedAt: new Date(),
      })
      .where(eq(churchSettings.id, existing.id));
  } else {
    await db.insert(churchSettings).values({
      churchName: input.churchName.trim(),
      legalName: input.legalName?.trim() || null,
      cnpj: input.cnpj?.trim() || null,
      email: input.email?.trim() || null,
      phone: input.phone?.trim() || null,
      address: input.address?.trim() || null,
    });
  }

  await logAudit({
    userId: session.user.id,
    acao: "edicao_configuracoes_igreja",
    entidade: "church_settings",
  });

  revalidatePath("/configuracoes/igreja");
  return { ok: true, message: "Configurações da igreja salvas." };
}

export async function importMembersCsv(
  csvText: string
): Promise<ActionResult<{ imported: number; ignored: number; errors: string[] }>> {
  const session = await requirePermission("membros", "criar");

  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return { ok: false, error: "Arquivo CSV vazio ou sem linhas de dados." };
  }

  let imported = 0;
  let ignored = 0;
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(";").map((c) => c.trim());
    const [fullName, phone, email, status] = cols;

    const parsed = memberSchema.safeParse({
      fullName,
      phone: phone || null,
      email: email || null,
      status: status || "ativo",
    });

    if (!parsed.success) {
      ignored += 1;
      errors.push(`Linha ${i + 1}: ${parsed.error.issues[0]?.message ?? "Inválida"}`);
      continue;
    }

    await db.insert(members).values(parsed.data);
    imported += 1;
  }

  await logAudit({
    userId: session.user.id,
    acao: "importacao_membros_csv",
    entidade: "member",
    detalhes: { imported, ignored },
  });

  revalidatePath("/membros");
  return {
    ok: true,
    message: `Importação concluída: ${imported} importado(s), ${ignored} ignorado(s).`,
    data: { imported, ignored, errors },
  };
}

export async function exportBackupJson(): Promise<
  ActionResult<{ json: string }>
> {
  const session = await requirePermission("permissoes", "exportar");

  const [
    membersData,
    visitorsData,
    cellsData,
    eventsData,
    ministriesData,
    financeData,
    noticesData,
  ] = await Promise.all([
    db.select().from(members),
    db.select().from(visitors),
    db.select().from(cells),
    db.select().from(events),
    db.select().from(ministries),
    db.select().from(financialTransactions),
    db.select().from(notices),
  ]);

  const backup = {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    tables: {
      members: membersData,
      visitors: visitorsData,
      cells: cellsData,
      events: eventsData,
      ministries: ministriesData,
      financialTransactions: financeData,
      notices: noticesData,
    },
  };

  await logAudit({
    userId: session.user.id,
    acao: "exportacao_backup_local",
    entidade: "backup",
  });

  return {
    ok: true,
    message: "Backup gerado com sucesso.",
    data: { json: JSON.stringify(backup, null, 2) },
  };
}
