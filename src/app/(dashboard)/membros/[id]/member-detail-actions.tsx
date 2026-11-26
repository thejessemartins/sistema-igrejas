"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, UserPlus } from "lucide-react";
import {
  FAMILY_RELATIONS,
  MEMBER_STATUSES,
  type FamilyRelation,
  type MemberStatus,
} from "@/lib/validations";
import {
  changeMemberStatus,
  linkFamilyMember,
  softDeleteMember,
} from "@/server/actions/members";

export function MemberDetailActions({
  memberId,
  memberName,
  currentStatus,
  candidates,
  canEdit,
  canDelete,
}: {
  memberId: string;
  memberName: string;
  currentStatus: string;
  candidates: Array<{ id: string; fullName: string }>;
  canEdit: boolean;
  canDelete: boolean;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<MemberStatus>(currentStatus as MemberStatus);
  const [relatedId, setRelatedId] = useState(candidates[0]?.id ?? "");
  const [relation, setRelation] = useState<FamilyRelation>("conjuge");
  const [confirmDelete, setConfirmDelete] = useState("");
  const [showDelete, setShowDelete] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function handleStatusChange() {
    setMsg(null);
    setErr(null);
    const res = await changeMemberStatus(memberId, status);
    if (!res.ok) {
      setErr(res.error);
      return;
    }
    setMsg(res.message);
    router.refresh();
  }

  async function handleLinkFamily(e: React.FormEvent) {
    e.preventDefault();
    if (!relatedId) return;
    setMsg(null);
    setErr(null);
    const res = await linkFamilyMember({
      memberId,
      relatedMemberId: relatedId,
      relation,
    });
    if (!res.ok) {
      setErr(res.error);
      return;
    }
    setMsg(res.message);
    router.refresh();
  }

  async function handleDelete(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setErr(null);
    const res = await softDeleteMember(memberId, confirmDelete);
    if (!res.ok) {
      setErr(res.error);
      return;
    }
    router.push("/membros");
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

      {canEdit ? (
        <div className="flex flex-wrap items-end gap-3 border-b border-neutral-200 pb-4">
          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600">
              Alterar Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as MemberStatus)}
              className="h-8 rounded-[2px] border border-neutral-200 bg-neutral-0 px-2 text-xs"
            >
              {MEMBER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={handleStatusChange}
            className="inline-flex h-8 items-center rounded-[2px] bg-blue-600 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-0 hover:bg-blue-700"
          >
            Confirmar status
          </button>
        </div>
      ) : null}

      {canEdit && candidates.length > 0 ? (
        <form
          onSubmit={handleLinkFamily}
          className="flex flex-wrap items-end gap-3 border-b border-neutral-200 pb-4"
        >
          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600">
              Vincular Familiar
            </label>
            <select
              value={relatedId}
              onChange={(e) => setRelatedId(e.target.value)}
              className="h-8 rounded-[2px] border border-neutral-200 bg-neutral-0 px-2 text-xs"
            >
              {candidates.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.fullName}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600">
              Relação
            </label>
            <select
              value={relation}
              onChange={(e) => setRelation(e.target.value as FamilyRelation)}
              className="h-8 rounded-[2px] border border-neutral-200 bg-neutral-0 px-2 text-xs"
            >
              {FAMILY_RELATIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="inline-flex h-8 items-center gap-1 rounded-[2px] border border-neutral-200 bg-neutral-0 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-800 hover:bg-neutral-50"
          >
            <UserPlus className="h-3.5 w-3.5" />
            Vincular
          </button>
        </form>
      ) : null}

      {canDelete ? (
        <div>
          {!showDelete ? (
            <button
              type="button"
              onClick={() => setShowDelete(true)}
              className="inline-flex h-8 items-center gap-1.5 rounded-[2px] border border-red-600/30 bg-red-600/10 px-3 text-[11px] font-bold uppercase tracking-wider text-red-600 hover:bg-red-600/20"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Excluir Membro
            </button>
          ) : (
            <form onSubmit={handleDelete} className="space-y-2 rounded-[2px] border border-red-600/30 bg-red-600/5 p-3">
              <p className="text-xs text-red-600">
                Para confirmar a exclusão lógica, digite exatamente:{" "}
                <strong>{memberName}</strong>
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  required
                  value={confirmDelete}
                  onChange={(e) => setConfirmDelete(e.target.value)}
                  placeholder="Digite o nome completo"
                  className="h-8 rounded-[2px] border border-neutral-300 bg-neutral-0 px-2 text-xs"
                />
                <button
                  type="submit"
                  className="inline-flex h-8 items-center rounded-[2px] bg-red-600 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-0"
                >
                  Confirmar exclusão
                </button>
                <button
                  type="button"
                  onClick={() => setShowDelete(false)}
                  className="inline-flex h-8 items-center rounded-[2px] border border-neutral-200 bg-neutral-0 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-700"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      ) : null}
    </div>
  );
}
