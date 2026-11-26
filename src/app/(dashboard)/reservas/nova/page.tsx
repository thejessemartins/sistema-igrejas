import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { getReservableResources } from "@/server/queries/reservations";
import { NovaReservaForm } from "./nova-reserva-form";

export default async function NovaReservaPage() {
  const resources = await getReservableResources();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nova Reserva"
        actions={
          <Link
            href="/reservas"
            className="inline-flex h-8 items-center rounded-[2px] border border-neutral-200 bg-neutral-0 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-700"
          >
            Voltar
          </Link>
        }
      />
      <NovaReservaForm
        resources={resources.map((r) => ({ id: r.id, name: r.name }))}
      />
    </div>
  );
}
