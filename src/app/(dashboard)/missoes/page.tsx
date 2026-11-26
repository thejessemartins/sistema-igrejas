import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { SeraCard } from "@/components/shared/sera-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { MoneyText } from "@/components/shared/money-text";
import { getSocialProjects } from "@/server/queries/missions";

export default async function MissoesPage() {
  const projects = await getSocialProjects();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Missões e Ação Social"
        description="Projetos sociais, campanhas e doações de itens."
      />

      {projects.length === 0 ? (
        <EmptyState
          title="Nenhum projeto cadastrado"
          description="Os projetos de missões e ação social aparecerão aqui."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {projects.map((p) => (
            <SeraCard
              key={p.id}
              title={p.name}
              description={p.description ?? p.kind}
              footer={
                <div className="flex items-center justify-between">
                  <StatusBadge label={p.status} variant="info" />
                  <Link
                    href={`/missoes/${p.id}`}
                    className="font-semibold text-blue-600 hover:underline"
                  >
                    Abrir projeto
                  </Link>
                </div>
              }
            >
              <div className="text-xs text-neutral-600">
                Meta:{" "}
                {p.goalCents ? (
                  <MoneyText cents={p.goalCents} className="font-semibold" />
                ) : (
                  "Sem meta definida"
                )}
              </div>
            </SeraCard>
          ))}
        </div>
      )}
    </div>
  );
}
