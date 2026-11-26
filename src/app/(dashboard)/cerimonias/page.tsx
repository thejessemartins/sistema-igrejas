import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { SeraCard } from "@/components/shared/sera-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate } from "@/lib/format";
import { getCeremonies } from "@/server/queries/ceremonies";

export default async function CerimoniasPage() {
  const items = await getCeremonies();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cerimônias"
        description="Batismos, casamentos, apresentações de crianças e memoriais."
      />

      {items.length === 0 ? (
        <EmptyState
          title="Nenhuma cerimônia"
          description="As solicitações de cerimônias aparecerão aqui."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((c) => (
            <SeraCard
              key={c.id}
              title={c.title}
              description={`${c.kind} · ${c.scheduledAt ? formatDate(c.scheduledAt, "dd/MM/yyyy") : "Sem data"}`}
              footer={
                <div className="flex items-center justify-between">
                  <StatusBadge label={c.status} variant="info" />
                  <Link
                    href={`/cerimonias/${c.id}`}
                    className="font-semibold text-blue-600 hover:underline"
                  >
                    Abrir
                  </Link>
                </div>
              }
            >
              <p className="text-xs text-neutral-600">
                Solicitante: {c.requestedByText ?? "—"}
              </p>
            </SeraCard>
          ))}
        </div>
      )}
    </div>
  );
}
