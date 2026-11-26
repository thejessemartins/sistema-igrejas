import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { SeraCard } from "@/components/shared/sera-card";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/format";
import { requirePermission } from "@/lib/session";
import { markNoticeAsRead } from "@/server/actions/notices";
import { getNoticeById } from "@/server/queries/notices";

export default async function AvisoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requirePermission("avisos", "ver");
  const { id } = await params;

  const data = await getNoticeById(id, session);
  if (!data) notFound();

  await markNoticeAsRead(id);

  const { notice, reads, canManage } = data;

  return (
    <div className="space-y-6">
      <PageHeader
        title={notice.title}
        description={`Publicado em ${formatDate(notice.publishAt, "dd/MM/yyyy HH:mm")} por ${notice.authorName ?? "Sistema"}`}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge label={notice.priority} variant="info" />
            <Link
              href="/avisos"
              className="inline-flex h-8 items-center rounded-[2px] border border-neutral-200 bg-neutral-0 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-700 hover:bg-neutral-50"
            >
              Voltar
            </Link>
          </div>
        }
      />

      <SeraCard title="Conteúdo">
        <p className="whitespace-pre-line text-sm text-neutral-800">
          {notice.body}
        </p>
      </SeraCard>

      {canManage ? (
        <SeraCard title={`Leituras Registradas (${reads.length})`}>
          {reads.length === 0 ? (
            <EmptyState
              title="Nenhuma leitura registrada"
              description="Quando usuários abrirem este aviso, aparecerão aqui."
            />
          ) : (
            <ul className="divide-y divide-neutral-200 text-xs">
              {reads.map((r) => (
                <li
                  key={r.userId}
                  className="flex items-center justify-between py-2"
                >
                  <span className="font-medium text-neutral-900">
                    {r.userName}
                  </span>
                  <span className="font-mono text-neutral-500">
                    {formatDate(r.readAt, "dd/MM/yyyy HH:mm")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </SeraCard>
      ) : null}
    </div>
  );
}
