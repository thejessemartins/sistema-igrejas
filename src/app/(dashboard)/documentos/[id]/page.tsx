import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { canManageDocuments } from "@/lib/document-access";
import { requireSession } from "@/lib/session";
import { getDocumentWithVersions } from "@/server/queries/documents";
import { DocumentDetailClient } from "./document-detail-client";

export default async function DocumentoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();
  const { id } = await params;

  const data = await getDocumentWithVersions(id, session.user.role);
  if (!data) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={data.doc.title}
        description={`Categoria: ${data.doc.category.toUpperCase()} · Versão atual: v${data.doc.currentVersion}`}
        actions={
          <Link
            href="/documentos"
            className="inline-flex h-8 items-center rounded-[2px] border border-neutral-200 bg-neutral-0 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-700 hover:bg-neutral-50"
          >
            Voltar
          </Link>
        }
      />

      <DocumentDetailClient
        doc={data.doc}
        versions={data.versions}
        canManage={canManageDocuments(session.user.role)}
      />
    </div>
  );
}
