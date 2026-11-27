import { PageHeader } from "@/components/shared/page-header";
import { requireSession } from "@/lib/session";
import { getKidsCheckinDashboard } from "@/server/queries/kids";
import { CheckinClient } from "./checkin-client";

export default async function InfantilCheckinPage() {
  await requireSession();
  const data = await getKidsCheckinDashboard();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Check-in Infantil Seguro"
        description="Entrada e saída de crianças no culto com código e responsável autorizado."
      />
      <CheckinClient
        childrenList={data.children}
        guardians={data.guardians}
        checkins={data.checkins}
        events={data.events}
      />
    </div>
  );
}
