"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { SeraCard } from "@/components/shared/sera-card";
import { DataTableShell } from "@/components/shared/data-table-shell";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { createMinistry } from "@/server/actions/ministries";

export function MinistriesClient({
  items,
  membersList,
  canCreate,
}: {
  items: Array<{
    id: string;
    name: string;
    description: string | null;
    leaderName: string | null;
    isActive: boolean;
    volunteersCount: number;
  }>;
  membersList: Array<{ id: string; fullName: string }>;
  canCreate: boolean;
}) {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [leaderMemberId, setLeaderMemberId] = useState("");
  const [err, setErr] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const res = await createMinistry({
      name,
      description,
      leaderMemberId: leaderMemberId || null,
      isActive: true,
    });
    if (!res.ok) return setErr(res.error);
    setName("");
    setDescription("");
    setShowCreate(false);
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
        <SeraCard title="Novo Ministério">
          <form onSubmit={handleCreate} className="grid gap-3 sm:grid-cols-3">
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome do ministério"
              className="h-8 rounded-[2px] border border-neutral-200 px-2 text-xs"
            />
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição"
              className="h-8 rounded-[2px] border border-neutral-200 px-2 text-xs"
            />
            <select
              value={leaderMemberId}
              onChange={(e) => setLeaderMemberId(e.target.value)}
              className="h-8 rounded-[2px] border border-neutral-200 bg-neutral-0 px-2 text-xs"
            >
              <option value="">Líder (opcional)</option>
              {membersList.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.fullName}
                </option>
              ))}
            </select>
            <div className="sm:col-span-3">
              <button
                type="submit"
                className="inline-flex h-8 items-center rounded-[2px] bg-blue-600 px-4 text-[11px] font-bold uppercase tracking-wider text-neutral-0 hover:bg-blue-700"
              >
                Salvar ministério
              </button>
            </div>
          </form>
        </SeraCard>
      ) : null}

      <DataTableShell
        toolbar={
          <div className="flex w-full items-center justify-between">
            <span className="text-xs text-neutral-500">
              {items.length} ministério(s)
            </span>
            {canCreate ? (
              <button
                type="button"
                onClick={() => setShowCreate((v) => !v)}
                className="inline-flex h-8 items-center gap-1.5 rounded-[2px] bg-blue-600 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-0 hover:bg-blue-700"
              >
                <Plus className="h-3.5 w-3.5" />
                Novo Ministério
              </button>
            ) : null}
          </div>
        }
      >
        {items.length === 0 ? (
          <div className="p-4">
            <EmptyState
              title="Nenhum ministério cadastrado"
              description="Crie o primeiro ministério acima."
            />
          </div>
        ) : (
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-25 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                <th className="px-4 py-2.5">Ministério</th>
                <th className="px-4 py-2.5">Líder</th>
                <th className="px-4 py-2.5">Voluntários</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {items.map((m) => (
                <tr key={m.id} className="hover:bg-neutral-25">
                  <td className="px-4 py-2.5 font-medium text-neutral-900">
                    <Link
                      href={`/ministerios/${m.id}`}
                      className="hover:text-blue-600"
                    >
                      {m.name}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 text-neutral-600">
                    {m.leaderName ?? "—"}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs">
                    {m.volunteersCount}
                  </td>
                  <td className="px-4 py-2.5">
                    <StatusBadge
                      label={m.isActive ? "Ativo" : "Inativo"}
                      variant={m.isActive ? "success" : "neutral"}
                    />
                  </td>
                  <td className="px-4 py-2.5">
                    <Link
                      href={`/ministerios/${m.id}`}
                      className="text-xs font-medium text-blue-600 hover:underline"
                    >
                      Gerenciar
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
