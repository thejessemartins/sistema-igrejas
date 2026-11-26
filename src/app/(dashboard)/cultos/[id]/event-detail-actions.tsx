"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Copy, XCircle, UserPlus } from "lucide-react";
import {
  cancelEvent,
  duplicateEvent,
  linkVisitorToEvent,
  markEventDone,
} from "@/server/actions/events";

export function EventDetailActions({
  eventId,
  status,
  visitorsList,
  canEdit,
  canCreate,
}: {
  eventId: string;
  status: string;
  visitorsList: Array<{ id: string; fullName: string }>;
  canEdit: boolean;
  canCreate: boolean;
}) {
  const router = useRouter();
  const [showCancel, setShowCancel] = useState(false);
  const [reason, setReason] = useState("");
  const [selectedVisitorId, setSelectedVisitorId] = useState(
    visitorsList[0]?.id ?? ""
  );
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function handleDone() {
    setMsg(null);
    setErr(null);
    const res = await markEventDone(eventId);
    if (!res.ok) return setErr(res.error);
    setMsg(res.message);
    router.refresh();
  }

  async function handleCancel(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setErr(null);
    const res = await cancelEvent(eventId, reason);
    if (!res.ok) return setErr(res.error);
    setShowCancel(false);
    setMsg(res.message);
    router.refresh();
  }

  async function handleDuplicate() {
    setMsg(null);
    setErr(null);
    const res = await duplicateEvent(eventId);
    if (!res.ok) return setErr(res.error);
    if (res.data?.id) {
      router.push(`/cultos/${res.data.id}`);
    }
    router.refresh();
  }

  async function handleLinkVisitor(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedVisitorId) return;
    setMsg(null);
    setErr(null);
    const res = await linkVisitorToEvent(eventId, selectedVisitorId);
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

      <div className="flex flex-wrap items-center gap-2">
        {canEdit && status === "agendado" ? (
          <button
            type="button"
            onClick={handleDone}
            className="inline-flex h-8 items-center gap-1.5 rounded-[2px] bg-blue-600 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-0 hover:bg-blue-700"
          >
            <CheckCircle className="h-3.5 w-3.5" />
            Marcar como realizado
          </button>
        ) : null}

        {canCreate ? (
          <button
            type="button"
            onClick={handleDuplicate}
            className="inline-flex h-8 items-center gap-1.5 rounded-[2px] border border-neutral-200 bg-neutral-0 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-800 hover:bg-neutral-50"
          >
            <Copy className="h-3.5 w-3.5" />
            Duplicar
          </button>
        ) : null}

        {canEdit && status !== "cancelado" ? (
          <button
            type="button"
            onClick={() => setShowCancel((v) => !v)}
            className="inline-flex h-8 items-center gap-1.5 rounded-[2px] border border-red-600/30 bg-red-600/10 px-3 text-[11px] font-bold uppercase tracking-wider text-red-600"
          >
            <XCircle className="h-3.5 w-3.5" />
            Cancelar evento
          </button>
        ) : null}
      </div>

      {showCancel ? (
        <form onSubmit={handleCancel} className="flex flex-wrap gap-2">
          <input
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Motivo do cancelamento"
            className="h-8 min-w-64 rounded-[2px] border border-neutral-300 px-2 text-xs"
          />
          <button
            type="submit"
            className="inline-flex h-8 items-center rounded-[2px] bg-red-600 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-0"
          >
            Confirmar cancelamento
          </button>
        </form>
      ) : null}

      {canEdit && visitorsList.length > 0 ? (
        <form
          onSubmit={handleLinkVisitor}
          className="flex flex-wrap items-center gap-2 border-t border-neutral-200 pt-4"
        >
          <select
            value={selectedVisitorId}
            onChange={(e) => setSelectedVisitorId(e.target.value)}
            className="h-8 rounded-[2px] border border-neutral-200 bg-neutral-0 px-2 text-xs"
          >
            {visitorsList.map((v) => (
              <option key={v.id} value={v.id}>
                {v.fullName}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="inline-flex h-8 items-center gap-1 rounded-[2px] border border-neutral-200 bg-neutral-0 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-800 hover:bg-neutral-50"
          >
            <UserPlus className="h-3.5 w-3.5" />
            Vincular Visitante
          </button>
        </form>
      ) : null}
    </div>
  );
}
