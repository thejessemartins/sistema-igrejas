"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarPlus, UserCheck } from "lucide-react";
import {
  FOLLOW_UP_LABELS,
  FOLLOW_UP_STATUSES,
  type FollowUpStatus,
} from "@/lib/validations";
import {
  changeVisitorStatus,
  convertVisitorToMember,
  registerVisitorVisit,
} from "@/server/actions/visitors";

export function VisitorDetailActions({
  visitorId,
  currentStatus,
  isConverted,
  canEdit,
  canConvert,
}: {
  visitorId: string;
  currentStatus: string;
  isConverted: boolean;
  canEdit: boolean;
  canConvert: boolean;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<FollowUpStatus>(
    currentStatus as FollowUpStatus
  );
  const [visitDate, setVisitDate] = useState(
    new Date().toISOString().slice(0, 16)
  );
  const [visitNotes, setVisitNotes] = useState("");
  const [needsDuplicateConfirm, setNeedsDuplicateConfirm] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function handleStatusChange() {
    setMsg(null);
    setErr(null);
    const res = await changeVisitorStatus(visitorId, status);
    if (!res.ok) {
      setErr(res.error);
      return;
    }
    setMsg(res.message);
    router.refresh();
  }

  async function handleRegisterVisit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setErr(null);
    const res = await registerVisitorVisit({
      visitorId,
      visitedAt: visitDate,
      notes: visitNotes,
    });
    if (!res.ok) {
      setErr(res.error);
      return;
    }
    setVisitNotes("");
    setMsg(res.message);
    router.refresh();
  }

  async function handleConvert(force = false) {
    setMsg(null);
    setErr(null);
    const res = await convertVisitorToMember(visitorId, force);
    if (!res.ok) {
      setErr(res.error);
      if (res.error.includes("Confirme para converter")) {
        setNeedsDuplicateConfirm(true);
      }
      return;
    }
    setNeedsDuplicateConfirm(false);
    setMsg(res.message);
    router.refresh();
  }

  return (
    <div className="space-y-5">
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
              Status de Acompanhamento
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as FollowUpStatus)}
              className="h-8 rounded-[2px] border border-neutral-200 bg-neutral-0 px-2 text-xs"
            >
              {FOLLOW_UP_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {FOLLOW_UP_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={handleStatusChange}
            className="inline-flex h-8 items-center rounded-[2px] border border-neutral-200 bg-neutral-0 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-800 hover:bg-neutral-50"
          >
            Atualizar status
          </button>
        </div>
      ) : null}

      {canEdit ? (
        <form
          onSubmit={handleRegisterVisit}
          className="flex flex-wrap items-end gap-3 border-b border-neutral-200 pb-4"
        >
          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600">
              Data/Hora da Visita
            </label>
            <input
              type="datetime-local"
              value={visitDate}
              onChange={(e) => setVisitDate(e.target.value)}
              className="h-8 rounded-[2px] border border-neutral-200 bg-neutral-0 px-2 text-xs"
            />
          </div>
          <div className="min-w-48 flex-1 space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600">
              Observação
            </label>
            <input
              value={visitNotes}
              onChange={(e) => setVisitNotes(e.target.value)}
              placeholder="Ex: Culto de domingo à noite"
              className="h-8 w-full rounded-[2px] border border-neutral-200 bg-neutral-0 px-2 text-xs"
            />
          </div>
          <button
            type="submit"
            className="inline-flex h-8 items-center gap-1.5 rounded-[2px] bg-blue-600 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-0 hover:bg-blue-700"
          >
            <CalendarPlus className="h-3.5 w-3.5" />
            Registrar Visita
          </button>
        </form>
      ) : null}

      {canConvert && !isConverted ? (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => handleConvert(false)}
            className="inline-flex h-8 items-center gap-1.5 rounded-[2px] bg-blue-600 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-0 hover:bg-blue-700"
          >
            <UserCheck className="h-3.5 w-3.5" />
            Converter em Membro
          </button>
          {needsDuplicateConfirm ? (
            <button
              type="button"
              onClick={() => handleConvert(true)}
              className="inline-flex h-8 items-center rounded-[2px] border border-amber-600/30 bg-amber-600/10 px-3 text-[11px] font-bold uppercase tracking-wider text-amber-600"
            >
              Confirmar conversão mesmo com telefone duplicado
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
