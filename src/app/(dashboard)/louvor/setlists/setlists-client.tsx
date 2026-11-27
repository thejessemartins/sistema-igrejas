"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addSongToSetlist, createSetlist } from "@/server/actions/worship";

interface Props {
  setlists: Array<{
    id: string;
    title: string;
    eventTitle: string;
    items: Array<{
      id: string;
      position: number;
      songTitle: string;
      defaultKey: string | null;
      musicalKeyOverride: string | null;
    }>;
  }>;
  events: Array<{ id: string; title: string }>;
  songs: Array<{ id: string; title: string; musicalKey: string | null }>;
}

export function SetlistsClient({ setlists, events, songs }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [eventId, setEventId] = useState(events[0]?.id ?? "");
  const [title, setTitle] = useState("Setlist Domingo");
  const [songId, setSongId] = useState(songs[0]?.id ?? "");
  const [keyOverride, setKeyOverride] = useState("");

  function handleCreateSetlist(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      await createSetlist(eventId, title);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {events.length > 0 && (
        <form
          onSubmit={handleCreateSetlist}
          className="flex flex-wrap gap-2 rounded-[2px] border border-neutral-200 bg-neutral-0 p-4"
        >
          <select
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            className="h-9 rounded-[2px] border border-neutral-300 bg-neutral-0 px-2 text-sm"
          >
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.title}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="h-9 flex-1 min-w-[180px] rounded-[2px] border border-neutral-300 px-2 text-sm"
          />
          <button
            type="submit"
            disabled={isPending}
            className="h-9 rounded-[2px] bg-neutral-900 px-4 text-xs font-bold uppercase text-neutral-0"
          >
            Criar Setlist
          </button>
        </form>
      )}

      <div className="space-y-4">
        {setlists.map((sl) => (
          <div
            key={sl.id}
            className="rounded-[2px] border border-neutral-200 bg-neutral-0 p-4 space-y-3"
          >
            <div>
              <h3 className="font-semibold text-neutral-900">{sl.title}</h3>
              <p className="text-xs text-neutral-500">{sl.eventTitle}</p>
            </div>
            <ol className="list-decimal pl-5 text-sm space-y-1">
              {sl.items.map((it) => (
                <li key={it.id}>
                  {it.songTitle}{" "}
                  <span className="font-mono text-xs text-neutral-500">
                    ({it.musicalKeyOverride ?? it.defaultKey ?? "—"})
                  </span>
                </li>
              ))}
            </ol>
            {songs.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                <select
                  value={songId}
                  onChange={(e) => setSongId(e.target.value)}
                  className="h-8 rounded-[2px] border border-neutral-300 bg-neutral-0 px-2 text-xs"
                >
                  {songs.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={keyOverride}
                  onChange={(e) => setKeyOverride(e.target.value)}
                  placeholder="Tom do dia (opcional)"
                  className="h-8 w-36 rounded-[2px] border border-neutral-300 px-2 text-xs"
                />
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() =>
                    startTransition(async () => {
                      await addSongToSetlist(sl.id, songId, keyOverride);
                      setKeyOverride("");
                      router.refresh();
                    })
                  }
                  className="h-8 rounded-[2px] bg-neutral-900 px-3 text-[11px] font-bold uppercase text-neutral-0"
                >
                  + Música
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
