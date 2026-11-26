"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { SeraCard } from "@/components/shared/sera-card";
import { MoneyText } from "@/components/shared/money-text";
import { EmptyState } from "@/components/shared/empty-state";
import { settleTransaction } from "@/server/actions/finance";

interface AccountRow {
  id: string;
  kind: string;
  description: string;
  amountCents: number;
  dueDate: string | null;
  paidAt: string | null;
  categoryName: string;
}

export function AccountsClient({
  upcoming,
  overdue,
  settled,
  canEdit,
}: {
  upcoming: AccountRow[];
  overdue: AccountRow[];
  settled: AccountRow[];
  canEdit: boolean;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"overdue" | "upcoming" | "settled">("overdue");
  const [err, setErr] = useState<string | null>(null);

  const list =
    tab === "overdue" ? overdue : tab === "upcoming" ? upcoming : settled;

  async function handleSettle(id: string) {
    setErr(null);
    const res = await settleTransaction(id);
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

      <div className="flex gap-2 border-b border-neutral-200 pb-2">
        <button
          type="button"
          onClick={() => setTab("overdue")}
          className={
            tab === "overdue"
              ? "rounded-[2px] bg-blue-600 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-neutral-0"
              : "rounded-[2px] border border-neutral-200 bg-neutral-0 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-neutral-700"
          }
        >
          Vencidas ({overdue.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("upcoming")}
          className={
            tab === "upcoming"
              ? "rounded-[2px] bg-blue-600 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-neutral-0"
              : "rounded-[2px] border border-neutral-200 bg-neutral-0 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-neutral-700"
          }
        >
          A Vencer ({upcoming.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("settled")}
          className={
            tab === "settled"
              ? "rounded-[2px] bg-blue-600 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-neutral-0"
              : "rounded-[2px] border border-neutral-200 bg-neutral-0 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-neutral-700"
          }
        >
          Pagas / Recebidas ({settled.length})
        </button>
      </div>

      <SeraCard title="Contas">
        {list.length === 0 ? (
          <EmptyState
            title="Nenhuma conta nesta aba"
            description="As contas com data de vencimento aparecerão aqui."
          />
        ) : (
          <ul className="divide-y divide-neutral-200 text-sm">
            {list.map((c) => (
              <li
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-2 py-2.5"
              >
                <div>
                  <p className="font-medium text-neutral-900">
                    {c.description}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {c.categoryName} · Vencimento: {c.dueDate ?? "—"}
                    {c.paidAt ? ` · Pago em: ${c.paidAt}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <MoneyText cents={c.amountCents} />
                  {canEdit && !c.paidAt ? (
                    <button
                      type="button"
                      onClick={() => handleSettle(c.id)}
                      className="inline-flex h-7 items-center gap-1 rounded-[2px] bg-blue-600 px-2.5 text-[11px] font-bold uppercase tracking-wider text-neutral-0 hover:bg-blue-700"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Dar baixa
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
