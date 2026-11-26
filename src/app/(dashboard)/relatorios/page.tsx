import Link from "next/link";
import { Download } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTableShell } from "@/components/shared/data-table-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { hasPermission } from "@/lib/permissions";
import { requirePermission } from "@/lib/session";
import { getReportData, type ReportType } from "@/server/queries/reports";

const REPORT_OPTIONS: Array<{ value: ReportType; label: string }> = [
  { value: "membros", label: "Membros por Status" },
  { value: "visitantes", label: "Visitantes e Acompanhamento" },
  { value: "celulas", label: "Células e Reuniões" },
  { value: "escalas", label: "Escalas de Voluntários" },
  { value: "financeiro", label: "Financeiro por Categoria" },
];

export default async function RelatoriosPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const session = await requirePermission("relatorios", "ver");
  const params = await searchParams;
  const canFinance = hasPermission(session, "financeiro", "ver");
  const canExport = hasPermission(session, "relatorios", "exportar");

  const available = REPORT_OPTIONS.filter(
    (o) => o.value !== "financeiro" || canFinance
  );

  const selectedType = (
    available.some((a) => a.value === params.type) ? params.type : "membros"
  ) as ReportType;

  const data = await getReportData(selectedType, session);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Relatórios"
        description="Consulte indicadores e exporte em CSV ou PDF."
        actions={
          canExport ? (
            <div className="flex items-center gap-2">
              <Link
                href={`/api/relatorios/export?type=${selectedType}&format=csv`}
                className="inline-flex h-8 items-center gap-1.5 rounded-[2px] border border-neutral-200 bg-neutral-0 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-800 hover:bg-neutral-50"
              >
                <Download className="h-3.5 w-3.5" />
                Exportar CSV
              </Link>
              <Link
                href={`/api/relatorios/export?type=${selectedType}&format=pdf`}
                className="inline-flex h-8 items-center gap-1.5 rounded-[2px] bg-blue-600 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-0 hover:bg-blue-700"
              >
                <Download className="h-3.5 w-3.5" />
                Exportar PDF
              </Link>
            </div>
          ) : null
        }
      />

      <DataTableShell
        toolbar={
          <form method="GET" className="flex items-center gap-2">
            <select
              name="type"
              defaultValue={selectedType}
              className="h-8 rounded-[2px] border border-neutral-200 bg-neutral-0 px-2 text-xs"
            >
              {available.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="inline-flex h-8 items-center rounded-[2px] border border-neutral-200 bg-neutral-0 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-700 hover:bg-neutral-50"
            >
              Gerar
            </button>
          </form>
        }
      >
        {data.rows.length === 0 ? (
          <div className="p-4">
            <EmptyState
              title="Sem dados para este relatório"
              description="Cadastre registros no módulo correspondente."
            />
          </div>
        ) : (
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-25 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                {data.headers.map((h) => (
                  <th key={h} className="px-4 py-2.5">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {data.rows.map((row, idx) => (
                <tr key={idx} className="hover:bg-neutral-25">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-4 py-2.5 text-neutral-800">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </DataTableShell>
    </div>
  );
}
