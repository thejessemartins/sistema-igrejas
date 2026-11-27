import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { requireSession } from "@/lib/session";
import { getWorshipSetlists } from "@/server/queries/worship";
import { SetlistsClient } from "./setlists-client";

export default async function LouvorSetlistsPage() {
  await requireSession();
  const data = await getWorshipSetlists();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Setlists de Culto"
        description="Ordem das músicas e tom do dia por culto."
        actions={
          <Link
            href="/louvor/musicas"
            className="inline-flex h-8 items-center rounded-[2px] border border-neutral-200 bg-neutral-0 px-3 text-[11px] font-bold uppercase text-neutral-700"
          >
            Repertório
          </Link>
        }
      />
      <SetlistsClient
        setlists={data.setlists}
        events={data.events}
        songs={data.songs}
      />
    </div>
  );
}
