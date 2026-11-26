"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { SeraCard } from "@/components/shared/sera-card";
import { DataTableShell } from "@/components/shared/data-table-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { createSchedule } from "@/server/actions/ministries";

export function SchedulesClient({
  items,
  eventsList,
  ministriesList,
  canCreate,
}: {
  items: Array<{
    id: string;
    title: string;
    eventTitle: string;
    eventStartsAt: Date;
    ministryName: string;
  }>;
  eventsList: Array<{ id: string; title: string }>;
  ministriesList: Array<{ id: string; name: string }>;
  canCreate: boolean;
}) {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [eventId, setEventId] = useState(eventsList[0]?.id ?? "");
  const [ministryId, setMinistryId] = useState(ministriesList[0]?.id ?? "");
  const [err, setErr] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const res = await createSchedule({ title, eventId, ministryId });
    if (!res.ok) return setErr(res.error);
    if (res.data?.id) {
      router.push(`/escalas/${res.data.id}`);
    }
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {err ? (
        <div className="rounded-[2px] border border-red-600/30 bg-red-600/10 px-3 py-2 text-xs text-red-600">
          {err}
        </div>
      ) : null}

      {canCreate && showCreate ? (
        <SeraCard title="Nova Escala">
          <form onSubmit={handleCreate} className="grid gap-3 sm:grid-cols-3">
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título da escala"
              className="h-8 rounded-[2px] border border-neutral-200 px-2 text-xs"
            />
            <select
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              className="h-8 rounded-[2px] border border-neutral-200 bg-neutral-0 px-2 text-xs"
            >
              {eventsList.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title}
                </option>
              ))}
            </select>
            <select
              value={ministryId}
              onChange={(e) => setMinistryId(e.target.value)}
              className="h-8 rounded-[2px] border border-neutral-200 bg-neutral-0 px-2 text-xs"
            >
              {ministriesList.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
            <div className="sm:col-span-3">
              <button
                type="submit"
                className="inline-flex h-8 items-center rounded-[2px] bg-blue-600 px-4 text-[11px] font-bold uppercase tracking-wider text-neutral-0 hover:bg-blue-700"
              >
                Criar escala
              </button>
            </div>
          </form>
        </SeraCard>
      ) : null}

      <DataTableShell
        toolbar={
          <div className="flex w-full items-center justify-between">
            <span className="text-xs text-neutral-500">
              {items.length} escala(s)
            </span>
            {canCreate ? (
              <button
                type="button"
                onClick={() => setShowCreate((v) => !v)}
                className="inline-flex h-8 items-center gap-1.5 rounded-[2px] bg-blue-600 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-0 hover:bg-blue-700"
              >
                <Plus className="h-3.5 w-3.5" />
                Nova Escala
              </button>
            ) : null}
          </div>
        }
      >
        {items.length === 0 ? (
          <div className="p-4">
            <EmptyState
              title="Nenhuma escala criada"
              description="Crie uma escala vinculada a um culto e ministério."
            />
          </div>
        ) : (
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-25 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                <th className="px-4 py-2.5">Escala</th>
                <th className="px-4 py-2.5">Culto / Evento</th>
                <th className="px-4 py-2.5">Ministério</th>
                <th className="px-4 py-2.5">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {items.map((s) => (
                <tr key={s.id} className="hover:bg-neutral-25">
                  <td className="px-4 py-2.5 font-medium text-neutral-900">
                    <Link
                      href={`/escalas/${s.id}`}
                      className="hover:text-blue-600"
                    >
                      {s.title}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 text-neutral-600">
                    {s.eventTitle}
                  </td>
                  <td className="px-4 py-2.5 text-neutral-600">
                    {s.ministryName}
                  </td>
                  <td className="px-4 py-2.5">
                    <Link
                      href={`/escalas/${s.id}`}
                      className="text-xs font-medium text-blue-600 hover:underline"
                    >
                      Abrir
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </DataTableShell>
    </div>
  );
}
