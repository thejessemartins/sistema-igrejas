import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { documents, documentVersions } from "@/db/schema";
import { canViewDocument } from "@/lib/document-access";
import { getServerSession } from "@/lib/session";
import { logAudit } from "@/server/services/audit";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { id } = await context.params;
  const url = new URL(req.url);
  const versionParam = url.searchParams.get("version");

  const [doc] = await db
    .select()
    .from(documents)
    .where(and(eq(documents.id, id), isNull(documents.deletedAt)))
    .limit(1);

  if (!doc) {
    return NextResponse.json(
      { error: "Documento não encontrado" },
      { status: 404 }
    );
  }

  if (!canViewDocument(session.user.role, doc.visibility)) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const targetVersion = versionParam
    ? Number(versionParam)
    : doc.currentVersion;

  const [ver] = await db
    .select()
    .from(documentVersions)
    .where(
      and(
        eq(documentVersions.documentId, doc.id),
        eq(documentVersions.versionNumber, targetVersion)
      )
    )
    .limit(1);

  if (!ver) {
    return NextResponse.json(
      { error: "Versão não encontrada" },
      { status: 404 }
    );
  }

  if (doc.visibility !== "todos_logados") {
    await logAudit({
      userId: session.user.id,
      acao: "download_documento_restrito",
      entidade: "document",
      entidadeId: doc.id,
      detalhes: {
        version: ver.versionNumber,
        visibility: doc.visibility,
      },
    });
  }

  const absPath = path.join(process.cwd(), ver.filePath);
  let fileBytes: Buffer;
  try {
    fileBytes = await readFile(absPath);
  } catch {
    return NextResponse.json(
      { error: "Arquivo não encontrado no armazenamento local" },
      { status: 404 }
    );
  }

  const ext = path.extname(ver.filePath).toLowerCase();
  const contentType =
    ext === ".pdf"
      ? "application/pdf"
      : ext === ".docx"
        ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        : "application/vnd.oasis.opendocument.text";

  const safeTitle = doc.title.replace(/[^a-zA-Z0-9_-]/g, "_");
  return new NextResponse(new Uint8Array(fileBytes), {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${safeTitle}-v${ver.versionNumber}${ext}"`,
    },
  });
}
