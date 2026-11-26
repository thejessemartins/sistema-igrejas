import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { SeraCard } from "@/components/shared/sera-card";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/format";
import { hasPermission } from "@/lib/permissions";
import { requirePermission } from "@/lib/session";
import { FOLLOW_UP_LABELS, type FollowUpStatus } from "@/lib/validations";
import { getVisitorById } from "@/server/queries/visitors";
import { VisitorDetailActions } from "./visitor-detail-actions";

export default async function VisitanteFichaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requirePermission("visitantes", "ver");
  const { id } = await params;

  const data = await getVisitorById(id);
  if (!data) notFound();

  const { visitor, visits } = data;
  const canEdit = hasPermission(session, "visitantes", "editar");
  const canConvert = canEdit && hasPermission(session, "membros", "criar");

  return (
    <div className="space-y-6">
      <PageHeader
        title={visitor.fullName}
        description={`Primeira visita em ${formatDate(visitor.firstVisitAt, "dd/MM/yyyy HH:mm")}`}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge
              label={
                FOLLOW_UP_LABELS[visitor.followUpStatus as FollowUpStatus] ??
                visitor.followUpStatus
              }
              variant="info"
            />
            <Link
              href="/visitantes"
              className="inline-flex h-8 items-center rounded-[2px] border border-neutral-200 bg-neutral-0 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-700 hover:bg-neutral-50"
            >
              Voltar
            </Link>
          </div>
        }
      />

      {visitor.convertedMemberId ? (
        <div className="rounded-[2px] border border-green-600/30 bg-green-600/10 px-4 py-3 text-xs text-green-600">
          Visitante convertido em membro.{" "}
          <Link
            href={`/membros/${visitor.convertedMemberId}`}
            className="font-semibold underline"
          >
            Abrir ficha do membro
          </Link>
        </div>
      ) : null}

      <SeraCard title="Dados do Visitante">
        <dl className="grid gap-4 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
              Telefone
            </dt>
            <dd className="mt-0.5 text-neutral-900">{visitor.phone ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
              E-mail
            </dt>
            <dd className="mt-0.5 text-neutral-900">{visitor.email ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
              Convidado por
            </dt>
            <dd className="mt-0.5 text-neutral-900">
              {visitor.invitedByMemberName ?? visitor.invitedByText ?? "—"}
            </dd>
          </div>
        </dl>
      </SeraCard>

      <SeraCard title="Acompanhamento e Ações">
        <VisitorDetailActions
          visitorId={visitor.id}
          currentStatus={visitor.followUpStatus}
          isConverted={Boolean(visitor.convertedMemberId)}
          canEdit={canEdit}
          canConvert={canConvert}
        />
      </SeraCard>

      <SeraCard title={`Histórico de Visitas (${visits.length})`}>
        {visits.length === 0 ? (
          <EmptyState
            title="Nenhuma visita registrada"
            description="Registre uma visita acima."
          />
        ) : (
          <ul className="space-y-2 text-xs">
            {visits.map((v) => (
              <li
                key={v.id}
                className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 pb-2"
              >
                <span className="font-mono text-neutral-700">
                  {formatDate(v.visitedAt, "dd/MM/yyyy HH:mm")}
                </span>
                <span className="text-neutral-600">{v.notes ?? "—"}</span>
              </li>
            ))}
          </ul>
        )}
      </SeraCard>
    </div>
  );
}
