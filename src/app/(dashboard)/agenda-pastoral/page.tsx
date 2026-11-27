import { PageHeader } from "@/components/shared/page-header";
import { requireSession } from "@/lib/session";
import {
  getPastoralScheduleForPastor,
  getPastoralScheduleReduced,
  getPastorsList,
} from "@/server/queries/pastoral";
import { AgendaClient } from "./agenda-client";

export default async function AgendaPastoralPage() {
  const session = await requireSession();
  const isPastor = session.user.role === "pastor";
  const [pastors, appointments] = await Promise.all([
    getPastorsList(),
    isPastor
      ? getPastoralScheduleForPastor(session.user.id)
      : getPastoralScheduleReduced(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Agenda Pastoral"
        description="Atendimentos e aconselhamento com sigilo reforçado."
      />
      <AgendaClient pastors={pastors} appointments={appointments} />
    </div>
  );
}
