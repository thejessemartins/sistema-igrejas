"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency as formatCents } from "@/lib/format";
import { cancelStoreSale } from "@/server/actions/store";

interface Sale {
  id: string;
  soldAt: Date;
  sellerName: string;
  buyerText: string | null;
  paymentMethod: string;
  totalCents: number;
  financialTransactionId: string | null;
  status: string;
  items: Array<{
    id: string;
    productNameSnapshot: string;
    quantity: number;
    unitPriceCentsSnapshot: number;
  }>;
}

export function VendasClient({ sales }: { sales: Sale[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{
    type: "ok" | "error";
    text: string;
  } | null>(null);

  function handleCancel(saleId: string) {
    setFeedback(null);
    startTransition(async () => {
      const res = await cancelStoreSale(saleId);
      if (!res.ok) {
        setFeedback({ type: "error", text: res.error });
        return;
      }
      setFeedback({ type: "ok", text: res.message ?? "Venda cancelada." });
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {feedback && (
        <div
          className={`rounded-[2px] border px-4 py-2 text-sm ${
            feedback.type === "ok"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {feedback.text}
        </div>
      )}

      <div className="overflow-x-auto rounded-[2px] border border-neutral-200 bg-neutral-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
            <tr>
              <th className="px-4 py-2.5">Data</th>
              <th className="px-4 py-2.5">Vendedor</th>
              <th className="px-4 py-2.5">Itens</th>
              <th className="px-4 py-2.5">Pagamento</th>
              <th className="px-4 py-2.5">Total</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {sales.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-neutral-500"
                >
                  Nenhuma venda registrada.
                </td>
              </tr>
            ) : (
              sales.map((s) => (
                <tr key={s.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-2.5 text-xs text-neutral-600">
                    {new Date(s.soldAt).toLocaleString("pt-BR")}
                  </td>
                  <td className="px-4 py-2.5 font-medium">{s.sellerName}</td>
                  <td className="px-4 py-2.5 text-xs text-neutral-600">
                    {s.items
                      .map((i) => `${i.quantity}x ${i.productNameSnapshot}`)
                      .join(", ")}
                  </td>
                  <td className="px-4 py-2.5 text-xs capitalize">
                    {s.paymentMethod.replace("_", " ")}
                  </td>
                  <td className="px-4 py-2.5 font-semibold">
                    {formatCents(s.totalCents)}
                  </td>
                  <td className="px-4 py-2.5 capitalize text-xs">
                    {s.status}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {s.status === "concluida" ? (
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleCancel(s.id)}
                        className="rounded-[2px] border border-red-200 px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                      >
                        Cancelar venda
                      </button>
                    ) : (
                      <span className="text-xs text-neutral-400">Estornada</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
