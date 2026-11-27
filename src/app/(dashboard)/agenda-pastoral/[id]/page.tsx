import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { requireSession } from "@/lib/session";
import { getPastoralAppointmentDetail } from "@/server/queries/pastoral";
import { DetalheClient } from "./detalhe-client";

export default async function AgendaDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();
  const { id } = await params;
  const data = await getPastoralAppointmentDetail(
    id,
    session.user.id,
    session.user.role
  );
  if (!data) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Atendimento: ${data.appointment.personName}`}
        description={`Categoria: ${data.appointment.reasonCategory} · Status: ${data.appointment.status}`}
        actions={
          <Link
            href="/agenda-pastoral"
            className="inline-flex h-8 items-center rounded-[2px] border border-neutral-200 bg-neutral-0 px-3 text-[11px] font-bold uppercase text-neutral-700"
          >
            Voltar
          </Link>
        }
      />

      <DetalheClient
        id={data.appointment.id}
        status={data.appointment.status}
        canSeeNote={data.canSeeNote}
        isOwnerPastor={data.isOwnerPastor}
        initialNote={data.noteBody ?? ""}
      />
    </div>
  );
}
