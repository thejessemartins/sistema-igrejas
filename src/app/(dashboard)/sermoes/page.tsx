import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SeraCard } from "@/components/shared/sera-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { hasPermission } from "@/lib/permissions";
import { requireSession } from "@/lib/session";
import { getSermons } from "@/server/queries/sermons";

export default async function SermoesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const session = await requireSession();
  const params = await searchParams;
  const items = await getSermons(session, params);
  const canCreate = hasPermission(session, "cultos", "criar");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sermões e Estudos"
        description="Biblioteca local de mensagens, referências bíblicas e mídia."
        actions={
          canCreate ? (
            <Link
              href="/sermoes/novo"
              className="inline-flex h-8 items-center gap-1.5 rounded-[2px] bg-blue-600 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-0 hover:bg-blue-700"
            >
              <Plus className="h-3.5 w-3.5" />
              Novo Sermão
            </Link>
          ) : null
        }
      />

      <form method="GET" className="flex items-center gap-2">
        <div className="flex items-center gap-2 rounded-[2px] border border-neutral-200 bg-neutral-0 px-2.5 py-1.5">
          <Search className="h-3.5 w-3.5 text-neutral-400" />
          <input
            name="search"
            defaultValue={params.search ?? ""}
            placeholder="Título, pregador, passagem ou série..."
            className="w-64 bg-transparent text-xs focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="inline-flex h-8 items-center rounded-[2px] border border-neutral-200 bg-neutral-0 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-700"
        >
          Buscar
        </button>
      </form>

      {items.length === 0 ? (
        <EmptyState
          title="Nenhum sermão encontrado"
          description="Ajuste a busca ou cadastre um novo sermão."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((s) => (
            <SeraCard
              key={s.id}
              title={s.title}
              description={`${s.preachedAt} · ${s.preacherText ?? "—"}`}
              footer={
                <div className="flex items-center justify-between">
                  <StatusBadge
                    label={s.isPublished ? "Publicado" : "Rascunho"}
                    variant={s.isPublished ? "success" : "neutral"}
                  />
                  <Link
                    href={`/sermoes/${s.id}`}
                    className="font-semibold text-blue-600 hover:underline"
                  >
                    Abrir
                  </Link>
                </div>
              }
            >
              <p className="text-xs text-neutral-600">
                {s.bibleReference ?? "Sem referência"} ·{" "}
                {s.seriesName ?? "Avulso"}
              </p>
            </SeraCard>
          ))}
        </div>
      )}
    </div>
  );
}
