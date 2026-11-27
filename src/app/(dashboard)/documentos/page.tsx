import Link from "next/link";
import { FileText, Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import {
  canManageDocuments,
  DOCUMENT_CATEGORIES,
  VISIBILITY_LABELS,
  type DocumentVisibility,
} from "@/lib/document-access";
import { requireSession } from "@/lib/session";
import { getVisibleDocuments } from "@/server/queries/documents";

export default async function DocumentosPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; q?: string }>;
}) {
  const session = await requireSession();
  const { categoria, q } = await searchParams;
  const docs = await getVisibleDocuments(session.user.role, categoria, q);
  const canManage = canManageDocuments(session.user.role);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documentos Oficiais"
        description="Atas, estatuto, regimentos e arquivos oficiais com controle de acesso e versionamento."
        actions={
          canManage ? (
            <Link
              href="/documentos/novo"
              className="inline-flex h-8 items-center gap-1.5 rounded-[2px] bg-neutral-900 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-0 hover:bg-neutral-800"
            >
              <Plus className="h-3.5 w-3.5" />
              Novo Documento
            </Link>
          ) : null
        }
      />

      <form className="flex flex-wrap items-center gap-3 rounded-[2px] border border-neutral-200 bg-neutral-0 p-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Buscar por título..."
            className="h-9 w-full rounded-[2px] border border-neutral-300 pl-8 pr-3 text-sm"
          />
        </div>
        <select
          name="categoria"
          defaultValue={categoria ?? "todas"}
          className="h-9 rounded-[2px] border border-neutral-300 bg-neutral-0 px-3 text-sm"
        >
          <option value="todas">Todas as categorias</option>
          {DOCUMENT_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat.toUpperCase()}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="h-9 rounded-[2px] border border-neutral-300 px-4 text-xs font-bold uppercase tracking-wider text-neutral-700 hover:bg-neutral-50"
        >
          Filtrar
        </button>
      </form>

      <div className="overflow-x-auto rounded-[2px] border border-neutral-200 bg-neutral-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
            <tr>
              <th className="px-4 py-2.5">Título</th>
              <th className="px-4 py-2.5">Categoria</th>
              <th className="px-4 py-2.5">Visibilidade</th>
              <th className="px-4 py-2.5">Versão</th>
              <th className="px-4 py-2.5 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {docs.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-neutral-500"
                >
                  Nenhum documento encontrado para o seu nível de acesso.
                </td>
              </tr>
            ) : (
              docs.map((doc) => (
                <tr key={doc.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-2.5 font-medium">
                    <Link
                      href={`/documentos/${doc.id}`}
                      className="inline-flex items-center gap-2 text-neutral-900 hover:underline"
                    >
                      <FileText className="h-4 w-4 text-neutral-400" />
                      {doc.title}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 uppercase text-xs text-neutral-600">
                    {doc.category}
                  </td>
                  <td className="px-4 py-2.5 text-xs text-neutral-600">
                    {VISIBILITY_LABELS[doc.visibility as DocumentVisibility] ??
                      doc.visibility}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs">
                    v{doc.currentVersion}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="inline-flex items-center gap-2">
                      <Link
                        href={`/documentos/${doc.id}`}
                        className="text-xs font-semibold text-neutral-700 hover:underline"
                      >
                        Detalhes
                      </Link>
                      <a
                        href={`/api/documentos/${doc.id}/download`}
                        className="inline-flex h-7 items-center rounded-[2px] border border-neutral-200 px-2.5 text-[11px] font-bold uppercase tracking-wider text-neutral-700 hover:bg-neutral-100"
                      >
                        Baixar
                      </a>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
