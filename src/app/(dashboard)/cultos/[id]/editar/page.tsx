import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { EventForm } from "@/components/events/event-form";
import { requirePermission } from "@/lib/session";
import { getEventById } from "@/server/queries/events";
import { searchMembersForSelect } from "@/server/queries/members";

export default async function EditarCultoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission("cultos", "editar");
  const { id } = await params;

  const [data, membersList] = await Promise.all([
    getEventById(id),
    searchMembersForSelect(""),
  ]);

  if (!data) notFound();

  const { event } = data;
  return (
    <div className="space-y-6">
      <PageHeader
        title={`Editar: ${event.title}`}
        actions={
          <Link
            href={`/cultos/${id}`}
            className="inline-flex h-8 items-center rounded-[2px] border border-neutral-200 bg-neutral-0 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-700 hover:bg-neutral-50"
          >
            Voltar
          </Link>
        }
      />

      <EventForm
        initial={{
          ...event,
          startsAt: event.startsAt.toISOString().slice(0, 16),
          endsAt: event.endsAt ? event.endsAt.toISOString().slice(0, 16) : null,
        }}
        membersList={membersList}
      />
    </div>
  );
}
