import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SeraCard } from "@/components/shared/sera-card";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/format";
import { hasPermission } from "@/lib/permissions";
import { requirePermission } from "@/lib/session";
import {
  EVENT_STATUSES,
  EVENT_TYPE_LABELS,
  EVENT_TYPES,
  type EventType,
} from "@/lib/validations";
import { getEvents } from "@/server/queries/events";

const statusVariant: Record<string, "info" | "success" | "danger"> = {
  agendado: "info",
  realizado: "success",
  cancelado: "danger",
};

export default async function CultosPage({
  searchParams,
}: {
  searchParams: Promise<{ eventType?: string; status?: string; view?: string }>;
}) {
  const session = await requirePermission("cultos", "ver");
  const params = await searchParams;
  const events = await getEvents({
    eventType: params.eventType,
    status: params.status,
  });

  const now = new Date();
  const upcoming = events.filter((e) => e.startsAt >= now);
  const past = events.filter((e) => e.startsAt < now).reverse();
  const canCreate = hasPermission(session, "cultos", "criar");
  const view = params.view === "calendario" ? "calendario" : "lista";

  // Grade mensal simples do mês atual
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const eventDays = new Set(
    events
      .filter(
        (e) => e.startsAt.getFullYear() === year && e.startsAt.getMonth() === month
      )
      .map((e) => e.startsAt.getDate())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cultos e Eventos"
        description="Agenda da igreja com visão em lista e calendário mensal."
        actions={
          <div className="flex items-center gap-2">
            <Link
              href={`/cultos?view=${view === "lista" ? "calendario" : "lista"}`}
              className="inline-flex h-8 items-center rounded-[2px] border border-neutral-200 bg-neutral-0 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-700 hover:bg-neutral-50"
            >
              {view === "lista" ? "Ver Calendário" : "Ver Lista"}
            </Link>
            {canCreate ? (
              <Link
                href="/cultos/novo"
                className="inline-flex h-8 items-center gap-1.5 rounded-[2px] bg-blue-600 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-0 hover:bg-blue-700"
              >
                <Plus className="h-3.5 w-3.5" />
                Novo Evento
              </Link>
            ) : null}
          </div>
        }
      />

      <form method="GET" className="flex flex-wrap items-center gap-2">
        <input type="hidden" name="view" value={view} />
        <select
          name="eventType"
          defaultValue={params.eventType ?? "all"}
          className="h-8 rounded-[2px] border border-neutral-200 bg-neutral-0 px-2 text-xs"
        >
          <option value="all">Todos os tipos</option>
          {EVENT_TYPES.map((t) => (
            <option key={t} value={t}>
              {EVENT_TYPE_LABELS[t]}
            </option>
          ))}
        </select>
        <select
          name="status"
          defaultValue={params.status ?? "all"}
          className="h-8 rounded-[2px] border border-neutral-200 bg-neutral-0 px-2 text-xs"
        >
          <option value="all">Todos os status</option>
          {EVENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="inline-flex h-8 items-center rounded-[2px] border border-neutral-200 bg-neutral-0 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-700 hover:bg-neutral-50"
        >
          Filtrar
        </button>
      </form>

      {view === "calendario" ? (
        <SeraCard title={`Calendário · ${month + 1}/${year}`}>
          <div className="grid grid-cols-7 gap-2 text-center text-xs">
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
              const isToday = day === now.getDate();
              const hasEvent = eventDays.has(day);
              return (
                <div
                  key={day}
                  className={
                    isToday
                      ? "rounded-[2px] bg-blue-600 p-3 font-mono font-bold text-neutral-0"
                      : hasEvent
                        ? "rounded-[2px] border border-blue-200 bg-blue-50 p-3 font-mono font-semibold text-blue-700"
                        : "rounded-[2px] border border-neutral-200 bg-neutral-0 p-3 font-mono text-neutral-700"
                  }
                >
                  {day}
                </div>
              );
            })}
          </div>
        </SeraCard>
      ) : (
        <div className="space-y-6">
          <SeraCard title={`Próximos (${upcoming.length})`}>
            {upcoming.length === 0 ? (
              <EmptyState
                title="Nenhum evento futuro"
                description="Cadastre um novo culto ou evento."
              />
            ) : (
              <ul className="divide-y divide-neutral-200 text-sm">
                {upcoming.map((e) => (
                  <li
                    key={e.id}
                    className="flex flex-wrap items-center justify-between gap-2 py-2.5"
                  >
                    <div>
                      <Link
                        href={`/cultos/${e.id}`}
                        className="font-medium text-neutral-900 hover:text-blue-600"
                      >
                        {e.title}
                      </Link>
                      <p className="text-xs text-neutral-500">
                        {formatDate(e.startsAt, "dd/MM/yyyy HH:mm")} ·{" "}
                        {EVENT_TYPE_LABELS[e.eventType as EventType] ??
                          e.eventType}{" "}
                        · {e.location ?? "Sem local"}
                      </p>
                    </div>
                    <StatusBadge
                      label={e.status}
                      variant={statusVariant[e.status] ?? "info"}
                    />
                  </li>
                ))}
              </ul>
            )}
          </SeraCard>

          <SeraCard title={`Anteriores (${past.length})`}>
            {past.length === 0 ? (
              <EmptyState
                title="Nenhum evento anterior"
                description="Eventos passados aparecerão aqui."
              />
            ) : (
              <ul className="divide-y divide-neutral-200 text-sm">
                {past.map((e) => (
                  <li
                    key={e.id}
                    className="flex flex-wrap items-center justify-between gap-2 py-2.5"
                  >
                    <div>
                      <Link
                        href={`/cultos/${e.id}`}
                        className="font-medium text-neutral-900 hover:text-blue-600"
                      >
                        {e.title}
                      </Link>
                      <p className="text-xs text-neutral-500">
                        {formatDate(e.startsAt, "dd/MM/yyyy HH:mm")} ·{" "}
                        {EVENT_TYPE_LABELS[e.eventType as EventType] ??
                          e.eventType}
                      </p>
                    </div>
                    <StatusBadge
                      label={e.status}
                      variant={statusVariant[e.status] ?? "info"}
                    />
                  </li>
                ))}
              </ul>
            )}
          </SeraCard>
        </div>
      )}
    </div>
  );
}
