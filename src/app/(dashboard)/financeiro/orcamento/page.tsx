import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { DataTableShell } from "@/components/shared/data-table-shell";
import { MoneyText } from "@/components/shared/money-text";
import { StatusBadge } from "@/components/shared/status-badge";
import { requirePermission } from "@/lib/session";
import { getAnnualBudget } from "@/server/queries/budget";

export default async function OrcamentoPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  await requirePermission("financeiro", "ver");
  const params = await searchParams;
  const year = Number(params.year) || new Date().getFullYear();

  const rows = await getAnnualBudget(year);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Orçamento Anual · ${year}`}
        description="Comparativo Previsto x Realizado (calculado a partir dos lançamentos pagos/recebidos)."
        actions={
          <Link
            href="/financeiro"
            className="inline-flex h-8 items-center rounded-[2px] border border-neutral-200 bg-neutral-0 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-700"
          >
            Voltar
          </Link>
        }
      />

      <DataTableShell
        toolbar={
          <form method="GET" className="flex items-center gap-2">
            <input
              type="number"
              name="year"
              defaultValue={year}
              className="h-8 w-24 rounded-[2px] border border-neutral-200 bg-neutral-0 px-2 text-xs"
            />
            <button
              type="submit"
              className="inline-flex h-8 items-center rounded-[2px] border border-neutral-200 bg-neutral-0 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-700"
            >
              Consultar Ano
            </button>
          </form>
        }
      >
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-25 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
              <th className="px-4 py-2.5">Categoria</th>
              <th className="px-4 py-2.5">Tipo</th>
              <th className="px-4 py-2.5">Previsto</th>
              <th className="px-4 py-2.5">Realizado</th>
              <th className="px-4 py-2.5">Diferença</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {rows.map((r) => {
              const overBudget = r.kind === "despesa" && r.diffCents > 0;
              return (
                <tr key={r.categoryId} className="hover:bg-neutral-25">
                  <td className="px-4 py-2.5 font-medium text-neutral-900">
                    {r.categoryName}
                  </td>
                  <td className="px-4 py-2.5">
                    <StatusBadge
                      label={r.kind}
                      variant={r.kind === "receita" ? "success" : "danger"}
                    />
                  </td>
                  <td className="px-4 py-2.5">
                    <MoneyText cents={r.plannedCents} />
                  </td>
                  <td className="px-4 py-2.5">
                    <MoneyText cents={r.realizedCents} />
                  </td>
                  <td className="px-4 py-2.5">
                    <MoneyText
                      cents={r.diffCents}
                      className={overBudget ? "font-semibold text-red-600" : ""}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </DataTableShell>
    </div>
  );
}
