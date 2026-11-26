import Link from "next/link";
import { BarChart3, CheckSquare } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SeraCard } from "@/components/shared/sera-card";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/format";
import { requirePermission } from "@/lib/session";
import { getAttendanceEvents } from "@/server/queries/attendance";

export default async function PresencaPage() {
  await requirePermission("presenca", "ver");
  const events = await getAttendanceEvents();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Presença em Cultos"
        description="Escolha um culto ou evento para realizar a chamada."
        actions={
          <Link
            href="/presenca/relatorio"
            className="inline-flex h-8 items-center gap-1.5 rounded-[2px] border border-neutral-200 bg-neutral-0 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-800 hover:bg-neutral-50"
          >
            <BarChart3 className="h-3.5 w-3.5" />
            Relatório de Frequência
          </Link>
        }
      />

      <SeraCard title="Cultos e Eventos Disponíveis">
        {events.length === 0 ? (
          <EmptyState
            title="Nenhum evento disponível"
            description="Cadastre um culto ou evento para registrar presença."
          />
        ) : (
          <ul className="divide-y divide-neutral-200 text-sm">
            {events.map((e) => (
              <li
                key={e.id}
                className="flex flex-wrap items-center justify-between gap-2 py-2.5"
              >
                <div>
                  <p className="font-medium text-neutral-900">{e.title}</p>
                  <p className="text-xs text-neutral-500">
                    {formatDate(e.startsAt, "dd/MM/yyyy HH:mm")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge label={e.status} variant="info" />
                  <Link
                    href={`/presenca/${e.id}`}
                    className="inline-flex h-7 items-center gap-1 rounded-[2px] bg-blue-600 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-0 hover:bg-blue-700"
                  >
                    <CheckSquare className="h-3.5 w-3.5" />
                    Fazer Chamada
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </SeraCard>
    </div>
  );
}
