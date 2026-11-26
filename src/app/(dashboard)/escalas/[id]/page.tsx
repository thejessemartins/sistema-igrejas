import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { formatDate } from "@/lib/format";
import { hasPermission } from "@/lib/permissions";
import { requirePermission } from "@/lib/session";
import { searchMembersForSelect } from "@/server/queries/members";
import { getScheduleById } from "@/server/queries/ministries";
import { ScheduleDetailClient } from "./schedule-detail-client";

export default async function EscalaFichaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requirePermission("escalas", "ver");
  const { id } = await params;

  const [data, candidates] = await Promise.all([
    getScheduleById(id),
    searchMembersForSelect(""),
  ]);

  if (!data) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title={data.schedule.title}
        description={`${data.schedule.ministryName} · ${data.schedule.eventTitle} (${formatDate(data.schedule.eventStartsAt, "dd/MM/yyyy HH:mm")})`}
        actions={
          <Link
            href="/escalas"
            className="inline-flex h-8 items-center rounded-[2px] border border-neutral-200 bg-neutral-0 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-700 hover:bg-neutral-50"
          >
            Voltar
          </Link>
        }
      />

      <ScheduleDetailClient
        scheduleId={data.schedule.id}
        assignments={data.assignments}
        candidates={candidates}
        canEdit={hasPermission(session, "escalas", "editar")}
      />
    </div>
  );
}
