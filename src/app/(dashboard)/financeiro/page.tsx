import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { SeraCard } from "@/components/shared/sera-card";
import { MoneyText } from "@/components/shared/money-text";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { requirePermission } from "@/lib/session";
import { getFinanceDashboard } from "@/server/queries/finance";

export default async function FinanceiroPage() {
  await requirePermission("financeiro", "ver");
  const data = await getFinanceDashboard();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Financeiro"
        description="Resumo mensal, lançamentos manuais, contas e fechamento."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/financeiro/lancamentos"
              className="inline-flex h-8 items-center rounded-[2px] bg-blue-600 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-0 hover:bg-blue-700"
            >
              Lançamentos
            </Link>
            <Link
              href="/financeiro/contas"
              className="inline-flex h-8 items-center rounded-[2px] border border-neutral-200 bg-neutral-0 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-800 hover:bg-neutral-50"
            >
              Contas
            </Link>
            <Link
              href="/financeiro/fechamento"
              className="inline-flex h-8 items-center rounded-[2px] border border-neutral-200 bg-neutral-0 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-800 hover:bg-neutral-50"
            >
              Fechamento
            </Link>
            <Link
              href="/financeiro/orcamento"
              className="inline-flex h-8 items-center rounded-[2px] border border-neutral-200 bg-neutral-0 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-800 hover:bg-neutral-50"
            >
              Orçamento
            </Link>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SeraCard title="Entradas (Mês)">
          <MoneyText
            cents={data.totalInCents}
            className="text-xl font-semibold text-green-600"
          />
        </SeraCard>
        <SeraCard title="Saídas (Mês)">
          <MoneyText
            cents={data.totalOutCents}
            className="text-xl font-semibold text-red-600"
          />
        </SeraCard>
        <SeraCard title="Saldo (Mês)">
          <MoneyText
            cents={data.balanceCents}
            className="text-xl font-semibold text-neutral-900"
          />
        </SeraCard>
        <SeraCard title="Contas Vencidas">
          <div className="flex items-baseline justify-between">
            <MoneyText
              cents={data.overdueCents}
              className="text-xl font-semibold text-amber-600"
            />
            <span className="text-xs text-neutral-500">
              {data.overdueCount} conta(s)
            </span>
          </div>
        </SeraCard>
      </div>

      <SeraCard title="Últimas Movimentações">
        {data.recent.length === 0 ? (
          <EmptyState
            title="Nenhuma movimentação"
            description="Registre receitas e despesas em Lançamentos."
          />
        ) : (
          <ul className="divide-y divide-neutral-200 text-sm">
            {data.recent.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between py-2.5"
              >
                <div>
                  <p className="font-medium text-neutral-900">
                    {r.description}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {r.transactionDate} · {r.categoryName}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge
                    label={r.kind}
                    variant={r.kind === "receita" ? "success" : "danger"}
                  />
                  <MoneyText
                    cents={r.amountCents}
                    className="text-sm font-medium"
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </SeraCard>
    </div>
  );
}
