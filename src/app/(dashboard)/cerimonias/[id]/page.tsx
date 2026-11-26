import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { SeraCard } from "@/components/shared/sera-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { getCeremonyById } from "@/server/queries/ceremonies";

export default async function CerimoniaDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getCeremonyById(id);
  if (!data) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title={data.ceremony.title}
        description={`Tipo: ${data.ceremony.kind}`}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge label={data.ceremony.status} variant="info" />
            <Link
              href={`/cerimonias/${id}/certificado`}
              className="inline-flex h-8 items-center rounded-[2px] bg-blue-600 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-0 hover:bg-blue-700"
            >
              Certificado
            </Link>
          </div>
        }
      />

      <SeraCard title={`Participantes (${data.participants.length})`}>
        {data.participants.length === 0 ? (
          <EmptyState
            title="Nenhum participante"
            description="Adicione participantes à cerimônia."
          />
        ) : (
          <ul className="divide-y divide-neutral-200 text-sm">
            {data.participants.map((p) => (
              <li key={p.id} className="flex justify-between py-2">
                <span>{p.personName}</span>
                <StatusBadge label={p.roleInCeremony} variant="neutral" />
              </li>
            ))}
          </ul>
        )}
      </SeraCard>
    </div>
  );
}
