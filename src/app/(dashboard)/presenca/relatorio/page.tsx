import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { SeraCard } from "@/components/shared/sera-card";
import { DataTableShell } from "@/components/shared/data-table-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { requirePermission } from "@/lib/session";
import { getAttendanceReport } from "@/server/queries/attendance";

export default async function RelatorioPresencaPage({
  searchParams,
}: {
  searchParams: Promise<{ startDate?: string; endDate?: string }>;
}) {
  await requirePermission("presenca", "ver");
  const params = await searchParams;
  const summary = await getAttendanceReport({
    startDate: params.startDate,
    endDate: params.endDate,
  });

  const lowFrequency = summary.filter((s) => s.lowFrequency);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Relatório de Frequência"
        description="Fórmula oficial: presenças / (presenças + ausências), ignorando justificados no denominador."
        actions={
          <Link
            href="/presenca"
            className="inline-flex h-8 items-center rounded-[2px] border border-neutral-200 bg-neutral-0 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-700 hover:bg-neutral-50"
          >
            Voltar
          </Link>
        }
      />

      <SeraCard
        title={`Alerta de Baixa Frequência (${lowFrequency.length})`}
        description="Membros ativos com frequência abaixo de 50% (mínimo 4 cultos) ou 3 ausências seguidas."
      >
        {lowFrequency.length === 0 ? (
          <EmptyState
            title="Nenhum alerta no período"
            description="Todos os membros avaliados estão acima do limite."
          />
        ) : (
          <ul className="divide-y divide-neutral-200 text-sm">
            {lowFrequency.map((m) => (
              <li
                key={m.memberId}
                className="flex items-center justify-between py-2"
              >
                <Link
                  href={`/presenca/membro/${m.memberId}`}
                  className="font-medium text-blue-600 hover:underline"
                >
                  {m.name}
                </Link>
                <StatusBadge
                  label={
                    m.threeConsecutiveAbsences
                      ? "3 ausências seguidas"
                      : `${m.rate ?? 0}%`
                  }
                  variant="danger"
                />
              </li>
            ))}
          </ul>
        )}
      </SeraCard>

      <DataTableShell
        toolbar={
          <form method="GET" className="flex flex-wrap items-center gap-2">
            <input
              type="date"
              name="startDate"
              defaultValue={params.startDate ?? ""}
              className="h-8 rounded-[2px] border border-neutral-200 bg-neutral-0 px-2 text-xs"
            />
            <input
              type="date"
              name="endDate"
              defaultValue={params.endDate ?? ""}
              className="h-8 rounded-[2px] border border-neutral-200 bg-neutral-0 px-2 text-xs"
            />
            <button
              type="submit"
              className="inline-flex h-8 items-center rounded-[2px] border border-neutral-200 bg-neutral-0 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-700 hover:bg-neutral-50"
            >
              Filtrar período
            </button>
          </form>
        }
      >
        {summary.length === 0 ? (
          <div className="p-4">
            <EmptyState
              title="Sem dados no período"
              description="Registre chamadas em cultos para visualizar o relatório."
            />
          </div>
        ) : (
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-25 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                <th className="px-4 py-2.5">Membro</th>
                <th className="px-4 py-2.5">Presenças</th>
                <th className="px-4 py-2.5">Ausências</th>
                <th className="px-4 py-2.5">Frequência</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {summary.map((s) => (
                <tr key={s.memberId} className="hover:bg-neutral-25">
                  <td className="px-4 py-2.5 font-medium">
                    <Link
                      href={`/presenca/membro/${s.memberId}`}
                      className="text-blue-600 hover:underline"
                    >
                      {s.name}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs">{s.present}</td>
                  <td className="px-4 py-2.5 font-mono text-xs">{s.absent}</td>
                  <td className="px-4 py-2.5 font-mono text-xs font-semibold">
                    {s.rate !== null ? `${s.rate}%` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </DataTableShell>
    </div>
  );
}
