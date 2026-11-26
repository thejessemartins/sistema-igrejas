"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { SeraCard } from "@/components/shared/sera-card";
import { EmptyState } from "@/components/shared/empty-state";
import {
  addMinistryMember,
  removeMinistryMember,
} from "@/server/actions/ministries";

export function MinistryDetailClient({
  ministryId,
  volunteers,
  candidates,
  canEdit,
}: {
  ministryId: string;
  volunteers: Array<{
    linkId: string;
    memberId: string;
    fullName: string;
    roleInMinistry: string;
    joinedAt: string;
  }>;
  candidates: Array<{ id: string; fullName: string }>;
  canEdit: boolean;
}) {
  const router = useRouter();
  const [memberId, setMemberId] = useState(candidates[0]?.id ?? "");
  const [roleInMinistry, setRoleInMinistry] = useState("");
  const [err, setErr] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const res = await addMinistryMember(ministryId, memberId, roleInMinistry);
    if (!res.ok) return setErr(res.error);
    setRoleInMinistry("");
    router.refresh();
  }

  async function handleRemove(linkId: string) {
    setErr(null);
    const res = await removeMinistryMember(ministryId, linkId);
    if (!res.ok) return setErr(res.error);
    router.refresh();
  }

  return (
    <SeraCard title={`Voluntários (${volunteers.length})`}>
      {err ? (
        <div className="mb-3 rounded-[2px] border border-red-600/30 bg-red-600/10 px-3 py-2 text-xs text-red-600">
          {err}
        </div>
      ) : null}

      {canEdit && candidates.length > 0 ? (
        <form
          onSubmit={handleAdd}
          className="mb-4 flex flex-wrap items-center gap-2 border-b border-neutral-200 pb-4"
        >
          <select
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
            className="h-8 rounded-[2px] border border-neutral-200 bg-neutral-0 px-2 text-xs"
          >
            {candidates.map((c) => (
              <option key={c.id} value={c.id}>
                {c.fullName}
              </option>
            ))}
          </select>
          <input
            required
            value={roleInMinistry}
            onChange={(e) => setRoleInMinistry(e.target.value)}
            placeholder="Função (ex: Vocal, Teclado)"
            className="h-8 rounded-[2px] border border-neutral-200 px-2 text-xs"
          />
          <button
            type="submit"
            className="inline-flex h-8 items-center gap-1 rounded-[2px] bg-blue-600 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-0 hover:bg-blue-700"
          >
            <Plus className="h-3.5 w-3.5" />
            Adicionar
          </button>
        </form>
      ) : null}

      {volunteers.length === 0 ? (
        <EmptyState
          title="Nenhum voluntário"
          description="Adicione voluntários acima."
        />
      ) : (
        <ul className="divide-y divide-neutral-200 text-sm">
          {volunteers.map((v) => (
            <li
              key={v.linkId}
              className="flex items-center justify-between py-2.5"
            >
              <div>
                <p className="font-medium text-neutral-900">{v.fullName}</p>
                <p className="text-xs text-neutral-500">
                  {v.roleInMinistry} · Entrada: {v.joinedAt}
                </p>
              </div>
              {canEdit ? (
                <button
                  type="button"
                  onClick={() => handleRemove(v.linkId)}
                  className="inline-flex h-7 items-center gap-1 rounded-[2px] border border-neutral-200 px-2 text-[11px] font-bold uppercase text-neutral-600 hover:bg-neutral-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remover
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </SeraCard>
  );
}
