"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  savePastoralNote,
  updatePastoralAppointmentStatus,
} from "@/server/actions/pastoral";

export function DetalheClient({
  id,
  status,
  canSeeNote,
  isOwnerPastor,
  initialNote,
}: {
  id: string;
  status: string;
  canSeeNote: boolean;
  isOwnerPastor: boolean;
  initialNote: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [note, setNote] = useState(initialNote);
  const [msg, setMsg] = useState<string | null>(null);

  function handleStatus(
    next: "confirmado" | "realizado" | "cancelado" | "faltou"
  ) {
    startTransition(async () => {
      const res = await updatePastoralAppointmentStatus(id, next);
      setMsg(res.ok ? (res.message ?? "Atualizado") : res.error);
      router.refresh();
    });
  }

  function handleSaveNote(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await savePastoralNote(id, note);
      setMsg(res.ok ? (res.message ?? "Salvo") : res.error);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {msg && (
        <div className="rounded-[2px] border border-neutral-200 bg-neutral-50 px-4 py-2 text-sm">
          {msg}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {status === "solicitado" && (
          <button
            type="button"
            disabled={isPending}
            onClick={() => handleStatus("confirmado")}
            className="h-8 rounded-[2px] bg-neutral-900 px-3 text-xs font-bold uppercase text-neutral-0"
          >
            Confirmar
          </button>
        )}
        {status !== "realizado" && (
          <button
            type="button"
            disabled={isPending}
            onClick={() => handleStatus("realizado")}
            className="h-8 rounded-[2px] border border-emerald-200 px-3 text-xs font-bold uppercase text-emerald-700"
          >
            Marcar Realizado
          </button>
        )}
        {status !== "cancelado" && (
          <button
            type="button"
            disabled={isPending}
            onClick={() => handleStatus("cancelado")}
            className="h-8 rounded-[2px] border border-red-200 px-3 text-xs font-bold uppercase text-red-700"
          >
            Cancelar
          </button>
        )}
      </div>

      {canSeeNote && (
        <form
          onSubmit={handleSaveNote}
          className="rounded-[2px] border border-neutral-200 bg-neutral-0 p-4 space-y-3"
        >
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-600">
            Nota Privada do Pastor
          </h3>
          <textarea
            rows={5}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={!isOwnerPastor}
            className="w-full rounded-[2px] border border-neutral-300 p-3 text-sm"
          />
          {isOwnerPastor && (
            <button
              type="submit"
              disabled={isPending}
              className="h-8 rounded-[2px] bg-neutral-900 px-4 text-xs font-bold uppercase text-neutral-0"
            >
              Salvar Nota
            </button>
          )}
        </form>
      )}
    </div>
  );
}
