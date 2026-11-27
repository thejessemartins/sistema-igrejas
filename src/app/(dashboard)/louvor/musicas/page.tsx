import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { requireSession } from "@/lib/session";
import { getWorshipSongs } from "@/server/queries/worship";
import { MusicasClient } from "./musicas-client";

export default async function LouvorMusicasPage() {
  await requireSession();
  const songs = await getWorshipSongs();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Repertório de Louvor"
        description="Cadastro de músicas, tons e letras cadastradas pela equipe."
        actions={
          <Link
            href="/louvor/setlists"
            className="inline-flex h-8 items-center rounded-[2px] bg-neutral-900 px-3 text-[11px] font-bold uppercase text-neutral-0"
          >
            Setlists
          </Link>
        }
      />
      <MusicasClient songs={songs} />
    </div>
  );
}
