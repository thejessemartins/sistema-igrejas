"use server";

import { revalidatePath } from "next/cache";
import { and, eq, isNull, or } from "drizzle-orm";
import { db } from "@/db";
import { memberFamilyLinks, memberHistory, members } from "@/db/schema";
import { requirePermission } from "@/lib/session";
import {
  linkFamilySchema,
  MEMBER_STATUSES,
  memberSchema,
  type MemberStatus,
} from "@/lib/validations";
import { deleteMemberPhoto, saveMemberPhoto } from "@/lib/upload";
import { logAudit } from "@/server/services/audit";
import type { ActionResult } from "./auth";

export async function createMember(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const session = await requirePermission("membros", "criar");

  const raw = Object.fromEntries(formData.entries());
  const parsed = memberSchema.safeParse({
    ...raw,
    birthDate: raw.birthDate || null,
    baptismDate: raw.baptismDate || null,
    joinedAt: raw.joinedAt || null,
    maritalStatus: raw.maritalStatus || null,
    cpf: raw.cpf || null,
    phone: raw.phone || null,
    email: raw.email || null,
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  if (parsed.data.cpf) {
    const [dup] = await db
      .select({ id: members.id })
      .from(members)
      .where(eq(members.cpf, parsed.data.cpf))
      .limit(1);

    if (dup) {
      return { ok: false, error: "Já existe um membro cadastrado com este CPF." };
    }
  }

  let photoPath: string | null = null;
  const photo = formData.get("photo");
  if (photo instanceof File && photo.size > 0) {
    try {
      photoPath = await saveMemberPhoto(photo);
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : "Erro ao salvar foto.",
      };
    }
  }

  const [created] = await db
    .insert(members)
    .values({
      ...parsed.data,
      photoPath,
    })
    .returning({ id: members.id });

  await logAudit({
    userId: session.user.id,
    acao: "criacao_membro",
    entidade: "member",
    entidadeId: created.id,
    detalhes: { nome: parsed.data.fullName },
  });

  revalidatePath("/membros");
  return {
    ok: true,
    message: "Membro cadastrado com sucesso.",
    data: { id: created.id },
  };
}

export async function updateMember(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  const session = await requirePermission("membros", "editar");

  const [existing] = await db
    .select()
    .from(members)
    .where(and(eq(members.id, id), isNull(members.deletedAt)))
    .limit(1);

  if (!existing) {
    return { ok: false, error: "Membro não encontrado." };
  }

  const raw = Object.fromEntries(formData.entries());
  const parsed = memberSchema.safeParse({
    ...raw,
    birthDate: raw.birthDate || null,
    baptismDate: raw.baptismDate || null,
    joinedAt: raw.joinedAt || null,
    maritalStatus: raw.maritalStatus || null,
    cpf: raw.cpf || null,
    phone: raw.phone || null,
    email: raw.email || null,
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  if (parsed.data.cpf && parsed.data.cpf !== existing.cpf) {
    const [dup] = await db
      .select({ id: members.id })
      .from(members)
      .where(eq(members.cpf, parsed.data.cpf))
      .limit(1);

    if (dup) {
      return { ok: false, error: "Já existe outro membro com este CPF." };
    }
  }

  let photoPath = existing.photoPath;
  const photo = formData.get("photo");
  if (photo instanceof File && photo.size > 0) {
    try {
      const newPath = await saveMemberPhoto(photo);
      await deleteMemberPhoto(existing.photoPath);
      photoPath = newPath;
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : "Erro ao salvar foto.",
      };
    }
  }

  await db
    .update(members)
    .set({
      ...parsed.data,
      photoPath,
      updatedAt: new Date(),
    })
    .where(eq(members.id, id));

  const trackedFields: Array<keyof typeof parsed.data> = [
    "fullName",
    "phone",
    "email",
    "status",
    "maritalStatus",
  ];
  const historyRows = trackedFields
    .filter((f) => (existing[f] ?? null) !== (parsed.data[f] ?? null))
    .map((f) => ({
      memberId: id,
      field: String(f),
      oldValue: existing[f] ? String(existing[f]) : null,
      newValue: parsed.data[f] ? String(parsed.data[f]) : null,
      changedBy: session.user.id,
    }));

  if (historyRows.length > 0) {
    await db.insert(memberHistory).values(historyRows);
  }

  await logAudit({
    userId: session.user.id,
    acao: "edicao_membro",
    entidade: "member",
    entidadeId: id,
  });

  revalidatePath("/membros");
  revalidatePath(`/membros/${id}`);
  return { ok: true, message: "Membro atualizado com sucesso." };
}

export async function changeMemberStatus(
  id: string,
  newStatus: MemberStatus
): Promise<ActionResult> {
  const session = await requirePermission("membros", "editar");
  if (!MEMBER_STATUSES.includes(newStatus)) {
    return { ok: false, error: "Status inválido." };
  }

  const [existing] = await db
    .select({ id: members.id, status: members.status })
    .from(members)
    .where(and(eq(members.id, id), isNull(members.deletedAt)))
    .limit(1);

  if (!existing) {
    return { ok: false, error: "Membro não encontrado." };
  }

  if (existing.status === newStatus) {
    return { ok: true, message: "Status mantido." };
  }

  await db
    .update(members)
    .set({ status: newStatus, updatedAt: new Date() })
    .where(eq(members.id, id));

  await db.insert(memberHistory).values({
    memberId: id,
    field: "status",
    oldValue: existing.status,
    newValue: newStatus,
    changedBy: session.user.id,
  });

  await logAudit({
    userId: session.user.id,
    acao: "mudanca_status_membro",
    entidade: "member",
    entidadeId: id,
    detalhes: { anterior: existing.status, novo: newStatus },
  });

  revalidatePath("/membros");
  revalidatePath(`/membros/${id}`);
  return { ok: true, message: "Status atualizado com sucesso." };
}

export async function softDeleteMember(
  id: string,
  confirmName: string
): Promise<ActionResult> {
  const session = await requirePermission("membros", "excluir");

  const [existing] = await db
    .select({ id: members.id, fullName: members.fullName })
    .from(members)
    .where(and(eq(members.id, id), isNull(members.deletedAt)))
    .limit(1);

  if (!existing) {
    return { ok: false, error: "Membro não encontrado." };
  }

  if (confirmName.trim() !== existing.fullName.trim()) {
    return {
      ok: false,
      error: "O nome digitado não confere com o nome do membro.",
    };
  }

  await db
    .update(members)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(eq(members.id, id));

  await logAudit({
    userId: session.user.id,
    acao: "exclusao_logica_membro",
    entidade: "member",
    entidadeId: id,
    detalhes: { nome: existing.fullName },
  });

  revalidatePath("/membros");
  return { ok: true, message: "Membro excluído com sucesso." };
}

export async function linkFamilyMember(input: unknown): Promise<ActionResult> {
  const session = await requirePermission("membros", "editar");
  const parsed = linkFamilySchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  const { memberId, relatedMemberId, relation } = parsed.data;
  if (memberId === relatedMemberId) {
    return { ok: false, error: "Não é possível vincular o membro a si mesmo." };
  }

  const [dup] = await db
    .select({ id: memberFamilyLinks.id })
    .from(memberFamilyLinks)
    .where(
      or(
        and(
          eq(memberFamilyLinks.memberId, memberId),
          eq(memberFamilyLinks.relatedMemberId, relatedMemberId)
        ),
        and(
          eq(memberFamilyLinks.memberId, relatedMemberId),
          eq(memberFamilyLinks.relatedMemberId, memberId)
        )
      )
    )
    .limit(1);

  if (dup) {
    return { ok: false, error: "Este vínculo familiar já existe." };
  }

  await db.insert(memberFamilyLinks).values({
    memberId,
    relatedMemberId,
    relation,
  });

  await logAudit({
    userId: session.user.id,
    acao: "vinculo_familiar",
    entidade: "member",
    entidadeId: memberId,
    detalhes: { relatedMemberId, relation },
  });

  revalidatePath(`/membros/${memberId}`);
  revalidatePath(`/membros/${relatedMemberId}`);
  return { ok: true, message: "Vínculo familiar adicionado." };
}

export async function unlinkFamilyMember(
  linkId: string,
  memberId: string
): Promise<ActionResult> {
  const session = await requirePermission("membros", "editar");

  await db.delete(memberFamilyLinks).where(eq(memberFamilyLinks.id, linkId));

  await logAudit({
    userId: session.user.id,
    acao: "remocao_vinculo_familiar",
    entidade: "member",
    entidadeId: memberId,
    detalhes: { linkId },
  });

  revalidatePath(`/membros/${memberId}`);
  return { ok: true, message: "Vínculo familiar removido." };
}
