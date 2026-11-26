"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { SeraCard } from "@/components/shared/sera-card";
import { createReservation } from "@/server/actions/reservations";

export function NovaReservaForm({
  resources,
}: {
  resources: Array<{ id: string; name: string }>;
}) {
  const router = useRouter();
  const [resourceId, setResourceId] = useState(resources[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [err, setErr] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const res = await createReservation({
      resourceId,
      title,
      startsAt,
      endsAt,
    });
    if (!res.ok) return setErr(res.error);
    router.push("/reservas");
    router.refresh();
  }

  return (
    <SeraCard title="Solicitar Reserva">
      <form onSubmit={handleSubmit} className="space-y-4">
        {err ? (
          <div className="rounded-[2px] border border-red-600/30 bg-red-600/10 px-3 py-2 text-xs text-red-600">
            {err}
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <select
            value={resourceId}
            onChange={(e) => setResourceId(e.target.value)}
            className="border-b border-neutral-300 py-1.5 text-sm"
          >
            {resources.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título / Motivo *"
            className="border-b border-neutral-300 py-1.5 text-sm"
          />
          <input
            type="datetime-local"
            required
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
            className="border-b border-neutral-300 py-1.5 text-sm"
          />
          <input
            type="datetime-local"
            required
            value={endsAt}
            onChange={(e) => setEndsAt(e.target.value)}
            className="border-b border-neutral-300 py-1.5 text-sm"
          />
        </div>

        <button
          type="submit"
          className="inline-flex h-9 items-center rounded-[2px] bg-blue-600 px-5 text-[11px] font-bold uppercase tracking-wider text-neutral-0 hover:bg-blue-700"
        >
          Solicitar reserva
        </button>
      </form>
    </SeraCard>
  );
}
