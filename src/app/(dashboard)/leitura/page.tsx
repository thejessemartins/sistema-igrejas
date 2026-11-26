import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { SeraCard } from "@/components/shared/sera-card";
import { EmptyState } from "@/components/shared/empty-state";
import { requireSession } from "@/lib/session";
import { getReadingPlans } from "@/server/queries/reading";

export default async function LeituraPage() {
  const session = await requireSession();
  const plans = await getReadingPlans(session);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leitura Bíblica"
        description="Planos de leitura e devocionais da igreja."
      />

      {plans.length === 0 ? (
        <EmptyState
          title="Nenhum plano ativo"
          description="Os planos de leitura aparecerão aqui."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {plans.map((p) => (
            <SeraCard
              key={p.id}
              title={p.title}
              description={p.description ?? `${p.durationDays} dias`}
              footer={
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs">
                    {p.completed}/{p.durationDays} dias ({p.pct}%)
                  </span>
                  <Link
                    href={`/leitura/${p.id}`}
                    className="font-semibold text-blue-600 hover:underline"
                  >
                    Abrir plano
                  </Link>
                </div>
              }
            >
              <div className="h-2 w-full rounded-[2px] bg-neutral-200">
                <div
                  className="h-2 rounded-[2px] bg-blue-600"
                  style={{ width: `${p.pct}%` }}
                />
              </div>
            </SeraCard>
          ))}
        </div>
      )}
    </div>
  );
}
