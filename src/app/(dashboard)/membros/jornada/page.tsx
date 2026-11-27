import { PageHeader } from "@/components/shared/page-header";
import { requireSession } from "@/lib/session";
import { getJourneyBoard } from "@/server/queries/journey";
import { JornadaClient } from "./jornada-client";

export default async function JornadaPage() {
  await requireSession();
  const data = await getJourneyBoard(90);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Jornada do Membro"
        description="Acompanhamento de integração e discipulado por etapas."
      />
      <JornadaClient
        stages={data.stages}
        members={data.memberCurrentStage}
      />
    </div>
  );
}
