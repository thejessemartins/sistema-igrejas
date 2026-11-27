import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { requireSession } from "@/lib/session";
import { getTripDetail } from "@/server/queries/transport";
import { ViagemClient } from "./viagem-client";

export default async function ViagemDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSession();
  const { id } = await params;
  const data = await getTripDetail(id);
  if (!data) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Viagem: ${data.trip.eventTitle}`}
        description={`${data.trip.vehicleName} · ${data.passengers.length}/${data.trip.capacity} vagas ocupadas`}
        actions={
          <Link
            href="/transporte"
            className="inline-flex h-8 items-center rounded-[2px] border border-neutral-200 bg-neutral-0 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-700"
          >
            Voltar
          </Link>
        }
      />

      <ViagemClient
        tripId={data.trip.id}
        capacity={data.trip.capacity}
        passengers={data.passengers}
      />
    </div>
  );
}
