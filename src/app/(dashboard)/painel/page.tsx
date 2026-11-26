import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { SeraCard } from "@/components/shared/sera-card";
import { MoneyText } from "@/components/shared/money-text";
import { requireSession } from "@/lib/session";
import { getDashboardStats } from "@/server/queries/dashboard";

export default async function PainelPage() {
  const session = await requireSession();
  const stats = await getDashboardStats(session);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Painel"
        description="Visão geral da igreja."
        actions={
          <Link
            href="/relatorios"
            className="inline-flex h-8 items-center rounded-[2px] border border-neutral-200 bg-neutral-0 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-800 hover:bg-neutral-50"
          >
            Relatórios
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SeraCard title="Membros Ativos">
          <p className="font-mono text-2xl font-semibold text-neutral-900">
            {stats.activeMembers}
          </p>
        </SeraCard>

        <SeraCard title="Visitantes no Mês">
          <p className="font-mono text-2xl font-semibold text-blue-600">
            {stats.monthVisitors}
          </p>
        </SeraCard>

        <SeraCard title="Último Culto Realizado">
          <p className="font-mono text-2xl font-semibold text-neutral-900">
            {stats.lastEventPresent}
          </p>
          <p className="mt-1 text-xs text-neutral-500">
            {stats.lastEventTitle ?? "Nenhum culto realizado"}
          </p>
        </SeraCard>

        {stats.canFinance ? (
          <SeraCard title="Saldo do Mês">
            <MoneyText
              cents={stats.balanceCents}
              className="text-2xl font-semibold text-neutral-900"
            />
            <p className="mt-1 text-xs text-neutral-500">
              {stats.overdueCount} conta(s) vencida(s)
            </p>
          </SeraCard>
        ) : null}
      </div>
    </div>
  );
}
