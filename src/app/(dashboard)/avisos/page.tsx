import Link from "next/link";
import { Plus, Pin } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SeraCard } from "@/components/shared/sera-card";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/format";
import { hasPermission } from "@/lib/permissions";
import { requirePermission } from "@/lib/session";
import { getMuralBlocks, getNoticesForUser } from "@/server/queries/notices";

export default async function AvisosPage() {
  const session = await requirePermission("avisos", "ver");

  const [notices, blocks] = await Promise.all([
    getNoticesForUser(session),
    getMuralBlocks(),
  ]);

  const canCreate = hasPermission(session, "avisos", "criar");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mural de Avisos"
        description="Comunicação interna da igreja."
        actions={
          canCreate ? (
            <Link
              href="/avisos/novo"
              className="inline-flex h-8 items-center gap-1.5 rounded-[2px] bg-blue-600 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-0 hover:bg-blue-700"
            >
              <Plus className="h-3.5 w-3.5" />
              Novo Aviso
            </Link>
          ) : null
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <SeraCard title={`Avisos (${notices.length})`}>
            {notices.length === 0 ? (
              <EmptyState
                title="Nenhum aviso publicado"
                description="Os avisos destinados a você aparecerão aqui."
              />
            ) : (
              <ul className="divide-y divide-neutral-200">
                {notices.map((n) => (
                  <li key={n.id} className="py-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Link
                        href={`/avisos/${n.id}`}
                        className="flex items-center gap-1.5 font-medium text-neutral-900 hover:text-blue-600"
                      >
                        {n.isPinned ? (
                          <Pin className="h-3.5 w-3.5 text-blue-600" />
                        ) : null}
                        {n.title}
                      </Link>
                      <div className="flex items-center gap-1.5">
                        {!n.readAt ? (
                          <StatusBadge label="Não lido" variant="info" />
                        ) : null}
                        <StatusBadge
                          label={n.priority}
                          variant={
                            n.priority === "urgente"
                              ? "danger"
                              : n.priority === "importante"
                                ? "warning"
                                : "neutral"
                          }
                        />
                      </div>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs text-neutral-600">
                      {n.body}
                    </p>
                    <p className="mt-1 text-[11px] text-neutral-400">
                      {formatDate(n.publishAt, "dd/MM/yyyy HH:mm")} ·{" "}
                      {n.authorName ?? "Sistema"}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </SeraCard>
        </div>

        <div className="space-y-4">
          <SeraCard title="Próximos Cultos">
            {blocks.upcomingEvents.length === 0 ? (
              <EmptyState
                title="Sem cultos agendados"
                description="Nenhum culto futuro."
              />
            ) : (
              <ul className="space-y-2 text-xs">
                {blocks.upcomingEvents.map((e) => (
                  <li
                    key={e.id}
                    className="flex items-center justify-between border-b border-neutral-100 pb-2"
                  >
                    <Link
                      href={`/cultos/${e.id}`}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      {e.title}
                    </Link>
                    <span className="font-mono text-neutral-500">
                      {formatDate(e.startsAt, "dd/MM HH:mm")}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </SeraCard>
        </div>
      </div>
    </div>
  );
}
