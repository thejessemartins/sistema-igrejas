import Link from "next/link";
import { notFound } from "next/navigation";
import { Edit } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SeraCard } from "@/components/shared/sera-card";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/format";
import { hasPermission } from "@/lib/permissions";
import { requirePermission } from "@/lib/session";
import { EVENT_TYPE_LABELS, type EventType } from "@/lib/validations";
import { getEventById } from "@/server/queries/events";
import { getVisitors } from "@/server/queries/visitors";
import { EventDetailActions } from "./event-detail-actions";

export default async function CultoFichaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requirePermission("cultos", "ver");
  const { id } = await params;

  const [data, visitorsList] = await Promise.all([
    getEventById(id),
    getVisitors(),
  ]);

  if (!data) notFound();

  const { event, linkedVisits } = data;
  const canEdit = hasPermission(session, "cultos", "editar");
  const canCreate = hasPermission(session, "cultos", "criar");

  return (
    <div className="space-y-6">
      <PageHeader
        title={event.title}
        description={`${EVENT_TYPE_LABELS[event.eventType as EventType] ?? event.eventType} · ${formatDate(event.startsAt, "dd/MM/yyyy HH:mm")}`}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge
              label={event.status}
              variant={
                event.status === "realizado"
                  ? "success"
                  : event.status === "cancelado"
                    ? "danger"
                    : "info"
              }
            />
            {canEdit ? (
              <Link
                href={`/cultos/${id}/editar`}
                className="inline-flex h-8 items-center gap-1.5 rounded-[2px] bg-blue-600 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-0 hover:bg-blue-700"
              >
                <Edit className="h-3.5 w-3.5" />
                Editar
              </Link>
            ) : null}
          </div>
        }
      />

      {event.status === "cancelado" && event.cancelReason ? (
        <div className="rounded-[2px] border border-red-600/30 bg-red-600/10 px-4 py-3 text-xs text-red-600">
          Evento cancelado. Motivo: {event.cancelReason}
        </div>
      ) : null}

      <SeraCard title="Detalhes">
        <dl className="grid gap-4 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
              Local
            </dt>
            <dd className="mt-0.5">{event.location ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
              Tema
            </dt>
            <dd className="mt-0.5">{event.theme ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
              Pregador
            </dt>
            <dd className="mt-0.5">
              {event.preacherMemberName ?? event.preacherText ?? "—"}
            </dd>
          </div>
        </dl>
      </SeraCard>

      <SeraCard title="Ações">
        <EventDetailActions
          eventId={event.id}
          status={event.status}
          visitorsList={visitorsList.map((v) => ({
            id: v.id,
            fullName: v.fullName,
          }))}
          canEdit={canEdit}
          canCreate={canCreate}
        />
      </SeraCard>

      <div className="grid gap-6 md:grid-cols-2">
        <SeraCard title={`Visitantes Vinculados (${linkedVisits.length})`}>
          {linkedVisits.length === 0 ? (
            <EmptyState
              title="Nenhum visitante vinculado"
              description="Vincule visitantes presentes acima."
            />
          ) : (
            <ul className="divide-y divide-neutral-200 text-sm">
              {linkedVisits.map((lv) => (
                <li key={lv.visitId} className="py-2">
                  <Link
                    href={`/visitantes/${lv.visitorId}`}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {lv.visitorName}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </SeraCard>

        <SeraCard title="Presença e Escala">
          <EmptyState
            title="Módulos em breve"
            description="A contagem de presença e a escala de ministérios serão integradas nos próximos prompts."
          />
        </SeraCard>
      </div>
    </div>
  );
}
