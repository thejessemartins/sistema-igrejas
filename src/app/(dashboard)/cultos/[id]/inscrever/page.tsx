import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { requireSession } from "@/lib/session";
import { getEventRegistrationData } from "@/server/queries/registrations";
import { InscreverClient } from "./inscrever-client";

export default async function EventoInscreverPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();
  const { id } = await params;
  const data = await getEventRegistrationData(id);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inscrições do Evento"
        description="Vagas, lista de espera automática e check-in no dia."
        actions={
          <Link
            href={`/cultos/${id}`}
            className="inline-flex h-8 items-center rounded-[2px] border border-neutral-200 bg-neutral-0 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-700"
          >
            Voltar ao Evento
          </Link>
        }
      />

      <InscreverClient
        eventId={id}
        config={data.config}
        registrations={data.registrations}
        defaultName={session.user.name}
      />
    </div>
  );
}
