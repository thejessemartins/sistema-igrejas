import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { SeraCard } from "@/components/shared/sera-card";
import { EmptyState } from "@/components/shared/empty-state";
import { requireSession } from "@/lib/session";
import { getSocialProjectById } from "@/server/queries/missions";

export default async function MissaoFichaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();
  const { id } = await params;
  const data = await getSocialProjectById(id, session);
  if (!data) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title={data.project.name}
        description={data.project.description ?? ""}
        actions={
          <Link
            href="/missoes"
            className="inline-flex h-8 items-center rounded-[2px] border border-neutral-200 bg-neutral-0 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-700"
          >
            Voltar
          </Link>
        }
      />

      <div className="grid gap-6 md:grid-cols-2">
        <SeraCard title={`Doações de Itens (${data.donations.length})`}>
          {data.donations.length === 0 ? (
            <EmptyState
              title="Nenhuma doação registrada"
              description="As doações de itens aparecerão aqui."
            />
          ) : (
            <ul className="divide-y divide-neutral-200 text-xs">
              {data.donations.map((d) => (
                <li key={d.id} className="flex justify-between py-2">
                  <span>{d.itemDescription}</span>
                  <span className="font-mono">
                    {d.quantity} {d.unit}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </SeraCard>

        {data.canSeeBeneficiaries ? (
          <SeraCard title={`Beneficiários (${data.beneficiaries.length})`}>
            {data.beneficiaries.length === 0 ? (
              <EmptyState
                title="Nenhum beneficiário"
                description="Cadastros protegidos por permissão."
              />
            ) : (
              <ul className="divide-y divide-neutral-200 text-xs">
                {data.beneficiaries.map((b) => (
                  <li key={b.id} className="py-2">
                    {b.fullName} · {b.addressDistrict ?? "—"}
                  </li>
                ))}
              </ul>
            )}
          </SeraCard>
        ) : null}
      </div>
    </div>
  );
}
