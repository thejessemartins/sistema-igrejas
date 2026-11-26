"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Unlock } from "lucide-react";
import { SeraCard } from "@/components/shared/sera-card";
import { MoneyText } from "@/components/shared/money-text";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { closeMonth, reopenMonth } from "@/server/actions/finance";

export function ClosingClient({
  closings,
  isAdmin,
}: {
  closings: Array<{
    id: string;
    year: number;
    month: number;
    totalInCents: number;
    totalOutCents: number;
    balanceCents: number;
    reopenedAt: Date | null;
    reopenReason: string | null;
  }>;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [reason, setReason] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function handleClose(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    const res = await closeMonth(year, month);
    if (!res.ok) return setErr(res.error);
    setMsg(res.message);
    router.refresh();
  }

  async function handleReopen(y: number, m: number) {
    const r = reason.trim() || window.prompt("Motivo da reabertura:") || "";
    if (!r.trim()) return;
    setErr(null);
    setMsg(null);
    const res = await reopenMonth(y, m, r);
    if (!res.ok) return setErr(res.error);
    setReason("");
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

      <SeraCard title="Fechar Mês">
        <form onSubmit={handleClose} className="flex flex-wrap items-center gap-2">
          <input
            type="number"
            value={month}
            min={1}
            max={12}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="h-8 w-20 rounded-[2px] border border-neutral-200 px-2 text-xs"
          />
          <input
            type="number"
            value={year}
            min={2020}
            max={2100}
            onChange={(e) => setYear(Number(e.target.value))}
            className="h-8 w-24 rounded-[2px] border border-neutral-200 px-2 text-xs"
          />
          <button
            type="submit"
            className="inline-flex h-8 items-center gap-1.5 rounded-[2px] bg-blue-600 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-0 hover:bg-blue-700"
          >
            <Lock className="h-3.5 w-3.5" />
            Fechar Mês
          </button>
        </form>
      </SeraCard>

      <SeraCard title="Histórico de Fechamentos">
        {closings.length === 0 ? (
          <EmptyState
            title="Nenhum fechamento registrado"
            description="Feche um mês acima para consolidar os totais."
          />
        ) : (
          <ul className="divide-y divide-neutral-200 text-sm">
            {closings.map((c) => {
              const isOpen = Boolean(c.reopenedAt);
              return (
                <li
                  key={c.id}
                  className="flex flex-wrap items-center justify-between gap-2 py-2.5"
                >
                  <div>
                    <p className="font-mono font-semibold text-neutral-900">
                      {String(c.month).padStart(2, "0")}/{c.year}
                    </p>
                    <p className="text-xs text-neutral-500">
                      Entradas: <MoneyText cents={c.totalInCents} /> · Saídas:{" "}
                      <MoneyText cents={c.totalOutCents} /> · Saldo:{" "}
                      <MoneyText cents={c.balanceCents} />
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge
                      label={isOpen ? "Reaberto" : "Fechado"}
                      variant={isOpen ? "warning" : "success"}
                    />
                    {isAdmin && !isOpen ? (
                      <button
                        type="button"
                        onClick={() => handleReopen(c.year, c.month)}
                        className="inline-flex h-7 items-center gap-1 rounded-[2px] border border-neutral-200 px-2 text-[11px] font-bold uppercase text-neutral-700 hover:bg-neutral-50"
                      >
                        <Unlock className="h-3 w-3" />
                        Reabrir
                      </button>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </SeraCard>
    </div>
  );
}
