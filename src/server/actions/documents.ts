"use server";

import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { documents, documentVersions } from "@/db/schema";
import {
  canManageDocuments,
  DOCUMENT_CATEGORIES,
  DOCUMENT_VISIBILITIES,
  type DocumentVisibility,
} from "@/lib/document-access";
import { requireSession } from "@/lib/session";
import { logAudit } from "@/server/services/audit";
import type { ActionResult } from "./auth";

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB

const createDocSchema = z.object({
  title: z.string().trim().min(2, "Título é obrigatório").max(200),
  category: z.enum(DOCUMENT_CATEGORIES),
  description: z.string().trim().max(1000).optional().nullable(),
  visibility: z.enum(DOCUMENT_VISIBILITIES),
  changeNotes: z.string().trim().max(500).optional().nullable(),
});

function validateMagicBytes(buf: Buffer, ext: string): boolean {
  if (ext === ".pdf") {
    return buf.subarray(0, 5).toString("ascii") === "%PDF-";
  }
  if (ext === ".docx" || ext === ".odt") {
    return (
      buf.length >= 4 &&
      buf[0] === 0x50 &&
      buf[1] === 0x4b &&
      buf[2] === 0x03 &&
      buf[3] === 0x04
    );
  }
  return false;
}

async function saveDocumentFile(
  file: File
): Promise<{ filePath: string; fileSizeBytes: number }> {
  if (file.size <= 0 || file.size > MAX_FILE_BYTES) {
    throw new Error("Arquivo deve ter entre 1 byte e 10 MB.");
  }

  const ext = path.extname(file.name).toLowerCase();
  if (![".pdf", ".docx", ".odt"].includes(ext)) {
    throw new Error("Formato inválido. Permitido apenas PDF, DOCX ou ODT.");
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  if (!validateMagicBytes(buffer, ext)) {
    throw new Error("Conteúdo do arquivo não corresponde ao formato declarado.");
  }

  const uploadDir = path.join(process.cwd(), "uploads", "documents");
  await mkdir(uploadDir, { recursive: true });

  const safeName = `${randomUUID()}${ext}`;
  const fullPath = path.join(uploadDir, safeName);
  await writeFile(fullPath, buffer);

  return {
    filePath: path.join("uploads", "documents", safeName),
    fileSizeBytes: buffer.length,
  };
}

export async function createDocument(formData: FormData): Promise<ActionResult> {
  const session = await requireSession();
  if (!canManageDocuments(session.user.role)) {
    return { ok: false, error: "Sem permissão para enviar documentos." };
  }

  const parsed = createDocSchema.safeParse({
    title: formData.get("title"),
    category: formData.get("category"),
    description: formData.get("description") || null,
    visibility: formData.get("visibility"),
    changeNotes: formData.get("changeNotes") || "Versão inicial",
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Selecione um arquivo PDF, DOCX ou ODT." };
  }

  let saved: { filePath: string; fileSizeBytes: number };
  try {
    saved = await saveDocumentFile(file);
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Erro ao salvar arquivo.",
    };
  }

  const created = await db.transaction(async (tx) => {
    const [doc] = await tx
      .insert(documents)
      .values({
        title: parsed.data.title,
        category: parsed.data.category,
        description: parsed.data.description || null,
        visibility: parsed.data.visibility,
        currentVersion: 1,
        createdBy: session.user.id,
      })
      .returning({ id: documents.id });

    await tx.insert(documentVersions).values({
      documentId: doc.id,
      versionNumber: 1,
      filePath: saved.filePath,
      fileSizeBytes: saved.fileSizeBytes,
      changeNotes: parsed.data.changeNotes || "Versão inicial",
      uploadedBy: session.user.id,
    });

    return doc;
  });

  await logAudit({
    userId: session.user.id,
    acao: "envio_documento",
    entidade: "document",
    entidadeId: created.id,
    detalhes: {
      title: parsed.data.title,
      category: parsed.data.category,
      visibility: parsed.data.visibility,
      version: 1,
    },
  });

  revalidatePath("/documentos");
  return { ok: true, message: "Documento enviado com sucesso." };
}

export async function uploadDocumentVersion(
  documentId: string,
  formData: FormData
): Promise<ActionResult> {
  const session = await requireSession();
  if (!canManageDocuments(session.user.role)) {
    return { ok: false, error: "Sem permissão para atualizar documentos." };
  }

  const [doc] = await db
    .select()
    .from(documents)
    .where(and(eq(documents.id, documentId), isNull(documents.deletedAt)))
    .limit(1);

  if (!doc) {
    return { ok: false, error: "Documento não encontrado." };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Selecione um arquivo PDF, DOCX ou ODT." };
  }

  const changeNotes =
    String(formData.get("changeNotes") ?? "").trim() || "Atualização";

  let saved: { filePath: string; fileSizeBytes: number };
  try {
    saved = await saveDocumentFile(file);
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Erro ao salvar arquivo.",
    };
  }

  const nextVersion = doc.currentVersion + 1;

  await db.transaction(async (tx) => {
    await tx.insert(documentVersions).values({
      documentId: doc.id,
      versionNumber: nextVersion,
      filePath: saved.filePath,
      fileSizeBytes: saved.fileSizeBytes,
      changeNotes,
      uploadedBy: session.user.id,
    });

    await tx
      .update(documents)
      .set({ currentVersion: nextVersion, updatedAt: new Date() })
      .where(eq(documents.id, doc.id));
  });

  await logAudit({
    userId: session.user.id,
    acao: "envio_nova_versao_documento",
    entidade: "document",
    entidadeId: doc.id,
    detalhes: { version: nextVersion, changeNotes },
  });

  revalidatePath("/documentos");
  revalidatePath(`/documentos/${doc.id}`);
  return { ok: true, message: `Versão ${nextVersion} enviada com sucesso.` };
}

export async function updateDocumentVisibility(
  documentId: string,
  visibility: DocumentVisibility
): Promise<ActionResult> {
  const session = await requireSession();
  if (!canManageDocuments(session.user.role)) {
    return { ok: false, error: "Sem permissão para alterar visibilidade." };
  }

  const [doc] = await db
    .select({ id: documents.id, visibility: documents.visibility })
    .from(documents)
    .where(and(eq(documents.id, documentId), isNull(documents.deletedAt)))
    .limit(1);

  if (!doc) {
    return { ok: false, error: "Documento não encontrado." };
  }

  await db
    .update(documents)
    .set({ visibility, updatedAt: new Date() })
    .where(eq(documents.id, documentId));

  await logAudit({
    userId: session.user.id,
    acao: "alteracao_visibilidade_documento",
    entidade: "document",
    entidadeId: documentId,
    detalhes: { from: doc.visibility, to: visibility },
  });

  revalidatePath("/documentos");
  revalidatePath(`/documentos/${documentId}`);
  return { ok: true, message: "Visibilidade atualizada." };
}
