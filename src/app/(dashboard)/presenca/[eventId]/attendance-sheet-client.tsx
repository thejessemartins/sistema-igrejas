"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCheck, Search } from "lucide-react";
import { SeraCard } from "@/components/shared/sera-card";
import type { AttendanceStatus } from "@/lib/validations";
import { saveEventAttendanceBatch } from "@/server/actions/attendance";

export function AttendanceSheetClient({
  eventId,
  membersList,
  savedMap,
  canEdit,
}: {
  eventId: string;
  membersList: Array<{ id: string; fullName: string }>;
  savedMap: Record<string, AttendanceStatus>;
  canEdit: boolean;
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>(
    () => {
      const init: Record<string, AttendanceStatus> = {};
      for (const m of membersList) {
        init[m.id] = savedMap[m.id] ?? "ausente";
      }
      return init;
    }
  );
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const filtered = membersList.filter((m) =>
    m.fullName.toLowerCase().includes(search.toLowerCase())
  );

  const presentCount = Object.values(statuses).filter(
    (s) => s === "presente"
  ).length;
  const absentCount = Object.values(statuses).filter(
    (s) => s === "ausente"
  ).length;
  const justifiedCount = Object.values(statuses).filter(
    (s) => s === "justificado"
  ).length;

  function markAllPresent() {
    const next: Record<string, AttendanceStatus> = {};
    for (const m of membersList) next[m.id] = "presente";
    setStatuses(next);
  }

  async function handleSave() {
    setSaving(true);
    setMsg(null);
    setErr(null);

    const entries = membersList.map((m) => ({
      memberId: m.id,
      personNameSnapshot: m.fullName,
      status: statuses[m.id] ?? "ausente",
    }));

    const res = await saveEventAttendanceBatch(eventId, entries);
    setSaving(false);
    if (!res.ok) return setErr(res.error);
    setMsg(res.message);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {err ? (
        <div className="rounded-[2px] border border-red-600/30 bg-red-600/10 px-3 py-2 text-xs text-red-600">
          {err}
        </div>
      ) : null}
      {msg ? (
        <div className="rounded-[2px] border border-green-600/30 bg-green-600/10 px-3 py-2 text-xs text-green-600">
          {msg}
        </div>
      ) : null}

      <SeraCard
        title="Lista de Chamada"
        description={`Presentes: ${presentCount} · Ausentes: ${absentCount} · Justificados: ${justifiedCount} · Total: ${membersList.length}`}
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200 pb-4">
          <div className="flex items-center gap-2 rounded-[2px] border border-neutral-200 bg-neutral-25 px-2.5 py-1.5">
            <Search className="h-3.5 w-3.5 text-neutral-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar membro..."
              className="w-56 bg-transparent text-xs focus:outline-none"
            />
          </div>

          {canEdit ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={markAllPresent}
                className="inline-flex h-8 items-center gap-1.5 rounded-[2px] border border-neutral-200 bg-neutral-0 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-800 hover:bg-neutral-50"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Marcar todos presentes
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={handleSave}
                className="inline-flex h-8 items-center rounded-[2px] bg-blue-600 px-4 text-[11px] font-bold uppercase tracking-wider text-neutral-0 hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "Salvando..." : "Salvar chamada"}
              </button>
            </div>
          ) : null}
        </div>

        <ul className="divide-y divide-neutral-200 text-sm">
          {filtered.map((m) => (
            <li
              key={m.id}
              className="flex flex-wrap items-center justify-between gap-2 py-2"
            >
              <span className="font-medium text-neutral-900">{m.fullName}</span>
              <div className="flex items-center gap-1">
                {(["presente", "ausente", "justificado"] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    disabled={!canEdit}
                    onClick={() =>
                      setStatuses((prev) => ({ ...prev, [m.id]: st }))
                    }
                    className={
                      statuses[m.id] === st
                        ? "rounded-[2px] bg-blue-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-0"
                        : "rounded-[2px] border border-neutral-200 bg-neutral-0 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-600 hover:bg-neutral-50"
                    }
                  >
                    {st}
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </SeraCard>
    </div>
  );
}
