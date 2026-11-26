import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { SeraCard } from "@/components/shared/sera-card";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/format";
import { requirePermission } from "@/lib/session";
import { getMySchedules } from "@/server/queries/ministries";

export default async function MinhasEscalasPage() {
  const session = await requirePermission("escalas", "ver");
  const items = await getMySchedules(session.user.memberId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Minhas Escalas"
        description="Escalas futuras e recentes vinculadas ao seu cadastro."
        actions={
          <Link
            href="/escalas"
            className="inline-flex h-8 items-center rounded-[2px] border border-neutral-200 bg-neutral-0 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-700 hover:bg-neutral-50"
          >
            Todas as Escalas
          </Link>
        }
      />

      <SeraCard title="Designações">
        {items.length === 0 ? (
          <EmptyState
            title="Nenhuma escala encontrada"
            description="Você ainda não possui escalas vinculadas."
          />
        ) : (
          <ul className="divide-y divide-neutral-200 text-sm">
            {items.map((item) => (
              <li
                key={item.assignmentId}
                className="flex flex-wrap items-center justify-between gap-2 py-2.5"
              >
                <div>
                  <p className="font-medium text-neutral-900">
                    {item.eventTitle} · {item.ministryName}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {formatDate(item.eventStartsAt, "dd/MM/yyyy HH:mm")} · Função:{" "}
                    {item.assignmentRole}
                  </p>
                </div>
                <StatusBadge label={item.status} variant="info" />
              </li>
            ))}
          </ul>
        )}
      </SeraCard>
    </div>
  );
}
