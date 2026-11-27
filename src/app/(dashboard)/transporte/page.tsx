import { PageHeader } from "@/components/shared/page-header";
import { requireSession } from "@/lib/session";
import { getTransportDashboard } from "@/server/queries/transport";
import { TransporteClient } from "./transporte-client";

export default async function TransportePage() {
  const session = await requireSession();
  const data = await getTransportDashboard();
  const canManage = ["admin", "pastor", "secretario"].includes(
    session.user.role
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transporte e Logística"
        description="Veículos, motoristas e viagens vinculadas a eventos."
      />
      <TransporteClient
        vehicles={data.vehicles}
        trips={data.trips}
        events={data.events}
        canManage={canManage}
      />
    </div>
  );
}
