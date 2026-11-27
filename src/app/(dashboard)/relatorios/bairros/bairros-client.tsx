"use client";

import { useState } from "react";

interface NeighborhoodGroup {
  key: string;
  label: string;
  memberCount: number;
  cellCount: number;
  members: Array<{
    id: string;
    fullName: string;
    city: string | null;
    cellId: string | null;
  }>;
  cells: Array<{
    id: string;
    name: string;
    meetingDay: string | null;
  }>;
}

export function BairrosClient({ groups }: { groups: NeighborhoodGroup[] }) {
  const [selectedKey, setSelectedKey] = useState<string | null>(
    groups[0]?.key ?? null
  );
  const maxMembers = Math.max(1, ...groups.map((g) => g.memberCount));
  const selected = groups.find((g) => g.key === selectedKey) ?? null;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-[2px] border border-neutral-200 bg-neutral-0 p-4 space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-600">
          Distribuição por Bairro
        </h2>
        <div className="space-y-2">
          {groups.map((g) => {
            const isSelected = g.key === selectedKey;
            const widthPct = Math.max(
              4,
              Math.round((g.memberCount / maxMembers) * 100)
            );
            return (
              <button
                key={g.key}
                type="button"
                onClick={() => setSelectedKey(g.key)}
                className={`w-full text-left rounded-[2px] p-2 transition ${
                  isSelected ? "bg-blue-50" : "hover:bg-neutral-50"
                }`}
              >
                <div className="flex justify-between text-xs font-medium">
                  <span>{g.label}</span>
                  <span className="font-mono">
                    {g.memberCount} membro(s) · {g.cellCount} célula(s)
                  </span>
                </div>
                <div className="mt-1 h-2 w-full rounded-[2px] bg-neutral-100">
                  <div
                    className={`h-2 rounded-[2px] ${
                      isSelected ? "bg-blue-600" : "bg-neutral-400"
                    }`}
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-[2px] border border-neutral-200 bg-neutral-0 p-4 space-y-4">
        {selected ? (
          <>
            <h2 className="text-sm font-bold text-neutral-900">
              {selected.label}
            </h2>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Células ({selected.cells.length})
              </h3>
              <ul className="mt-1 divide-y divide-neutral-100 text-sm">
                {selected.cells.length === 0 ? (
                  <li className="py-2 text-xs text-neutral-500">
                    Nenhuma célula neste bairro.
                  </li>
                ) : (
                  selected.cells.map((c) => (
                    <li key={c.id} className="py-1.5 flex justify-between">
                      <span>{c.name}</span>
                      <span className="text-xs text-neutral-500">
                        {c.meetingDay ?? "Dia não informado"}
                      </span>
                    </li>
                  ))
                )}
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Membros ({selected.members.length})
              </h3>
              <ul className="mt-1 max-h-72 overflow-y-auto divide-y divide-neutral-100 text-sm">
                {selected.members.map((m) => (
                  <li key={m.id} className="py-1.5 flex justify-between">
                    <span>{m.fullName}</span>
                    <span className="text-xs text-neutral-500">
                      {m.cellId ? "Em célula" : "Sem célula"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : (
          <p className="text-sm text-neutral-500">Selecione um bairro.</p>
        )}
      </div>
    </div>
  );
}
