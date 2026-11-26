import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { SeraCard } from "@/components/shared/sera-card";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/format";
import { requirePermission } from "@/lib/session";
import { getMemberAttendanceHistory } from "@/server/queries/attendance";

export default async function PresencaMembroPage({
  params,
}: {
  params: Promise<{ memberId: string }>;
}) {
  await requirePermission("presenca", "ver");
  const { memberId } = await params;

  const data = await getMemberAttendanceHistory(memberId);
  if (!data) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Frequência: ${data.member.fullName}`}
        description={`Presenças: ${data.presentCount} · Ausências: ${data.absentCount} · Frequência: ${data.rate !== null ? `${data.rate}%` : "—"}`}
        actions={
          <Link
            href={`/membros/${memberId}`}
            className="inline-flex h-8 items-center rounded-[2px] border border-neutral-200 bg-neutral-0 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-700 hover:bg-neutral-50"
          >
            Ficha do Membro
          </Link>
        }
      />

      <SeraCard title="Histórico de Cultos">
        {data.rows.length === 0 ? (
          <EmptyState
            title="Sem registros de presença"
            description="Nenhum registro encontrado para este membro."
          />
        ) : (
          <ul className="divide-y divide-neutral-200 text-sm">
            {data.rows.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between py-2.5"
              >
                <div>
                  <p className="font-medium text-neutral-900">{r.eventTitle}</p>
                  <p className="text-xs text-neutral-500">
                    {formatDate(r.startsAt, "dd/MM/yyyy HH:mm")}
                  </p>
                </div>
                <StatusBadge
                  label={r.status}
                  variant={
                    r.status === "presente"
                      ? "success"
                      : r.status === "ausente"
                        ? "danger"
                        : "warning"
                  }
                />
              </li>
            ))}
          </ul>
        )}
      </SeraCard>
    </div>
  );
}
