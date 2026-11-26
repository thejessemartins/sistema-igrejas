"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, RefreshCw } from "lucide-react";
import { SeraCard } from "@/components/shared/sera-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import {
  addScheduleAssignment,
  replaceScheduleAssignment,
} from "@/server/actions/ministries";

export function ScheduleDetailClient({
  scheduleId,
  assignments,
  candidates,
  canEdit,
}: {
  scheduleId: string;
  assignments: Array<{
    id: string;
    memberId: string;
    memberName: string;
    assignmentRole: string;
    status: string;
  }>;
  candidates: Array<{ id: string; fullName: string }>;
  canEdit: boolean;
}) {
  const router = useRouter();
  const [memberId, setMemberId] = useState(candidates[0]?.id ?? "");
  const [assignmentRole, setAssignmentRole] = useState("");
  const [conflictWarning, setConflictWarning] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function handleAdd(force = false) {
    setErr(null);
    setMsg(null);
    const res = await addScheduleAssignment(
      scheduleId,
      memberId,
      assignmentRole,
      force
    );
    if (!res.ok) {
      setErr(res.error);
      if (res.error.includes("Conflito detectado")) {
        setConflictWarning(true);
      }
      return;
    }
    setConflictWarning(false);
    setAssignmentRole("");
    setMsg(res.message);
    router.refresh();
  }

  async function handleReplace(assignmentId: string, newMemberId: string) {
    if (!newMemberId) return;
    setErr(null);
    setMsg(null);
    const res = await replaceScheduleAssignment(
      scheduleId,
      assignmentId,
      newMemberId
    );
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

      <SeraCard title={`Voluntários Escalados (${assignments.length})`}>
        {canEdit && candidates.length > 0 ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAdd(false);
            }}
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
              value={assignmentRole}
              onChange={(e) => setAssignmentRole(e.target.value)}
              placeholder="Função na escala"
              className="h-8 rounded-[2px] border border-neutral-200 px-2 text-xs"
            />
            <button
              type="submit"
              className="inline-flex h-8 items-center gap-1 rounded-[2px] bg-blue-600 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-0 hover:bg-blue-700"
            >
              <Plus className="h-3.5 w-3.5" />
              Escalar
            </button>
            {conflictWarning ? (
              <button
                type="button"
                onClick={() => handleAdd(true)}
                className="inline-flex h-8 items-center rounded-[2px] border border-amber-600/30 bg-amber-600/10 px-3 text-[11px] font-bold uppercase tracking-wider text-amber-600"
              >
                Confirmar mesmo com conflito
              </button>
            ) : null}
          </form>
        ) : null}

        {assignments.length === 0 ? (
          <EmptyState
            title="Nenhum voluntário escalado"
            description="Adicione voluntários acima."
          />
        ) : (
          <ul className="divide-y divide-neutral-200 text-sm">
            {assignments.map((a) => (
              <li
                key={a.id}
                className="flex flex-wrap items-center justify-between gap-2 py-2.5"
              >
                <div>
                  <p className="font-medium text-neutral-900">
                    {a.memberName}
                  </p>
                  <p className="text-xs text-neutral-500">{a.assignmentRole}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge
                    label={a.status}
                    variant={
                      a.status === "confirmado"
                        ? "success"
                        : a.status === "substituido"
                          ? "warning"
                          : "info"
                    }
                  />
                  {canEdit && a.status !== "substituido" && candidates.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => handleReplace(a.id, candidates[0].id)}
                      className="inline-flex h-7 items-center gap-1 rounded-[2px] border border-neutral-200 px-2 text-[11px] font-bold uppercase text-neutral-700 hover:bg-neutral-50"
                    >
                      <RefreshCw className="h-3 w-3" />
                      Substituir
                    </button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </SeraCard>
    </div>
  );
}
