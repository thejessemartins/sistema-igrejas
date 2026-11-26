import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { hasPermission } from "@/lib/permissions";
import { requirePermission } from "@/lib/session";
import { getEvents } from "@/server/queries/events";
import { getMinistries, getSchedules } from "@/server/queries/ministries";
import { SchedulesClient } from "./schedules-client";

export default async function EscalasPage() {
  const session = await requirePermission("escalas", "ver");

  const [items, eventsList, ministriesList] = await Promise.all([
    getSchedules(),
    getEvents(),
    getMinistries(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Escalas de Voluntários"
        description="Organize as escalas por culto e ministério."
        actions={
          <Link
            href="/escalas/minhas"
            className="inline-flex h-8 items-center rounded-[2px] border border-neutral-200 bg-neutral-0 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-700 hover:bg-neutral-50"
          >
            Minhas Escalas
          </Link>
        }
      />

      <SchedulesClient
        items={items}
        eventsList={eventsList.map((e) => ({ id: e.id, title: e.title }))}
        ministriesList={ministriesList.map((m) => ({ id: m.id, name: m.name }))}
        canCreate={hasPermission(session, "escalas", "criar")}
      />
    </div>
  );
}
