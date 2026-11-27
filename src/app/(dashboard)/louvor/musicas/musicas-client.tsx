"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createWorshipSong } from "@/server/actions/worship";

export function MusicasClient({
  songs,
}: {
  songs: Array<{
    id: string;
    title: string;
    authorText: string | null;
    musicalKey: string | null;
    themeTags: string | null;
  }>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [authorText, setAuthorText] = useState("");
  const [musicalKey, setMusicalKey] = useState("G");

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      await createWorshipSong({ title, authorText, musicalKey });
      setTitle("");
      setAuthorText("");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleCreate}
        className="flex flex-wrap gap-2 rounded-[2px] border border-neutral-200 bg-neutral-0 p-4"
      >
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título da música"
          required
          className="h-9 flex-1 min-w-[200px] rounded-[2px] border border-neutral-300 px-2 text-sm"
        />
        <input
          type="text"
          value={authorText}
          onChange={(e) => setAuthorText(e.target.value)}
          placeholder="Autor / Ministério"
          className="h-9 w-48 rounded-[2px] border border-neutral-300 px-2 text-sm"
        />
        <input
          type="text"
          value={musicalKey}
          onChange={(e) => setMusicalKey(e.target.value)}
          placeholder="Tom (ex: G)"
          className="h-9 w-24 rounded-[2px] border border-neutral-300 px-2 text-sm"
        />
        <button
          type="submit"
          disabled={isPending}
          className="h-9 rounded-[2px] bg-neutral-900 px-4 text-xs font-bold uppercase text-neutral-0"
        >
          Adicionar Música
        </button>
      </form>

      <div className="overflow-x-auto rounded-[2px] border border-neutral-200 bg-neutral-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-[11px] font-bold uppercase text-neutral-500">
            <tr>
              <th className="px-4 py-2">Título</th>
              <th className="px-4 py-2">Autor</th>
              <th className="px-4 py-2">Tom</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {songs.map((s) => (
              <tr key={s.id}>
                <td className="px-4 py-2 font-medium">{s.title}</td>
                <td className="px-4 py-2 text-neutral-600">
                  {s.authorText ?? "—"}
                </td>
                <td className="px-4 py-2 font-mono text-xs">
                  {s.musicalKey ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
