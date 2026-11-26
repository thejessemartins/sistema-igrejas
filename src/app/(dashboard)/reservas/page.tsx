import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { requireSession } from "@/lib/session";
import { getReservations } from "@/server/queries/reservations";
import { ReservationsClient } from "./reservations-client";

export default async function ReservasPage() {
  const session = await requireSession();
  const items = await getReservations();
  const canApprove = ["admin", "pastor", "secretario"].includes(
    session.user.role
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reservas"
        description="Reservas de salas, equipamentos e veículos."
        actions={
          <Link
            href="/reservas/nova"
            className="inline-flex h-8 items-center gap-1.5 rounded-[2px] bg-blue-600 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-0 hover:bg-blue-700"
          >
            <Plus className="h-3.5 w-3.5" />
            Nova Reserva
          </Link>
        }
      />

      <ReservationsClient
        items={items}
        currentUserId={session.user.id}
        canApprove={canApprove}
      />
    </div>
  );
}
