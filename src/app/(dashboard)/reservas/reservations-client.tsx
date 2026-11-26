"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Ban } from "lucide-react";
import { DataTableShell } from "@/components/shared/data-table-shell";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate } from "@/lib/format";
import {
  cancelReservation,
  decideReservation,
} from "@/server/actions/reservations";

export function ReservationsClient({
  items,
  currentUserId,
  canApprove,
}: {
  items: Array<{
    id: string;
    title: string;
    resourceName: string;
    requestedByUserId: string;
    requestedByName: string;
    startsAt: Date;
    endsAt: Date;
    status: string;
  }>;
  currentUserId: string;
  canApprove: boolean;
}) {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);

  async function handleDecide(id: string, decision: "aprovada" | "recusada") {
    setErr(null);
    const res = await decideReservation(id, decision);
    if (!res.ok) return setErr(res.error);
    router.refresh();
  }

  async function handleCancel(id: string) {
    setErr(null);
    const res = await cancelReservation(id);
    if (!res.ok) return setErr(res.error);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {err ? (
        <div className="rounded-[2px] border border-red-600/30 bg-red-600/10 px-3 py-2 text-xs text-red-600">
          {err}
        </div>
      ) : null}

      <DataTableShell
        toolbar={
          <span className="text-xs text-neutral-500">
            {items.length} reserva(s)
          </span>
        }
      >
        {items.length === 0 ? (
          <div className="p-4">
            <EmptyState
              title="Nenhuma reserva"
              description="Solicite uma nova reserva."
            />
          </div>
        ) : (
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-25 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                <th className="px-4 py-2.5">Recurso</th>
                <th className="px-4 py-2.5">Título</th>
                <th className="px-4 py-2.5">Período</th>
                <th className="px-4 py-2.5">Solicitante</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {items.map((r) => (
                <tr key={r.id} className="hover:bg-neutral-25">
                  <td className="px-4 py-2.5 font-medium text-neutral-900">
                    {r.resourceName}
                  </td>
                  <td className="px-4 py-2.5">{r.title}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-neutral-600">
                    {formatDate(r.startsAt, "dd/MM HH:mm")} –{" "}
                    {formatDate(r.endsAt, "HH:mm")}
                  </td>
                  <td className="px-4 py-2.5 text-xs text-neutral-600">
                    {r.requestedByName}
                  </td>
                  <td className="px-4 py-2.5">
                    <StatusBadge
                      label={r.status}
                      variant={
                        r.status === "aprovada"
                          ? "success"
                          : r.status === "recusada" || r.status === "cancelada"
                            ? "danger"
                            : "warning"
                      }
                    />
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1">
                      {canApprove && r.status === "pendente" ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleDecide(r.id, "aprovada")}
                            className="inline-flex h-7 items-center gap-1 rounded-[2px] bg-blue-600 px-2 text-[10px] font-bold uppercase text-neutral-0"
                          >
                            <Check className="h-3 w-3" />
                            Aprovar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDecide(r.id, "recusada")}
                            className="inline-flex h-7 items-center gap-1 rounded-[2px] border border-red-600/30 px-2 text-[10px] font-bold uppercase text-red-600"
                          >
                            <X className="h-3 w-3" />
                            Recusar
                          </button>
                        </>
                      ) : null}
                      {r.requestedByUserId === currentUserId &&
                      (r.status === "pendente" || r.status === "aprovada") ? (
                        <button
                          type="button"
                          onClick={() => handleCancel(r.id)}
                          className="inline-flex h-7 items-center gap-1 rounded-[2px] border border-neutral-200 px-2 text-[10px] font-bold uppercase text-neutral-600"
                        >
                          <Ban className="h-3 w-3" />
                          Cancelar
                        </button>
                      ) : null}
                    </div>
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
