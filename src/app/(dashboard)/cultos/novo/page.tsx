import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { EventForm } from "@/components/events/event-form";
import { requirePermission } from "@/lib/session";
import { searchMembersForSelect } from "@/server/queries/members";

export default async function NovoCultoPage() {
  await requirePermission("cultos", "criar");
  const membersList = await searchMembersForSelect("");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Novo Culto / Evento"
        actions={
          <Link
            href="/cultos"
            className="inline-flex h-8 items-center rounded-[2px] border border-neutral-200 bg-neutral-0 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-700 hover:bg-neutral-50"
          >
            Voltar
          </Link>
        }
      />

      <EventForm membersList={membersList} />
    </div>
  );
}
