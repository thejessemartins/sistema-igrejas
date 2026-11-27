"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Plus } from "lucide-react";
import { formatCurrency as formatCents } from "@/lib/format";
import {
  createStoreProduct,
  toggleStoreProductActive,
  updateStoreProductStock,
} from "@/server/actions/store";

interface Product {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;
  stockQuantity: number;
  isActive: boolean;
}

export function ProdutosClient({ products }: { products: Product[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [lowStockThreshold, setLowStockThreshold] = useState(5);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priceReais, setPriceReais] = useState("10.00");
  const [stockQuantity, setStockQuantity] = useState("10");
  const [feedback, setFeedback] = useState<{
    type: "ok" | "error";
    text: string;
  } | null>(null);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    const priceCents = Math.round(Number(priceReais.replace(",", ".")) * 100);

    startTransition(async () => {
      const res = await createStoreProduct({
        name,
        description: description || null,
        priceCents,
        stockQuantity: Number(stockQuantity),
      });
      if (!res.ok) {
        setFeedback({ type: "error", text: res.error });
        return;
      }
      setFeedback({ type: "ok", text: res.message ?? "Produto criado." });
      setName("");
      setDescription("");
      setShowForm(false);
      router.refresh();
    });
  }

  function handleStockChange(id: string, qty: number) {
    startTransition(async () => {
      await updateStoreProductStock(id, Math.max(0, qty));
      router.refresh();
    });
  }

  function handleToggle(id: string, isActive: boolean) {
    startTransition(async () => {
      await toggleStoreProductActive(id, !isActive);
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

      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex h-9 items-center gap-2 rounded-[2px] bg-neutral-900 px-4 text-xs font-bold uppercase tracking-wider text-neutral-0 hover:bg-neutral-800"
        >
          <Plus className="h-4 w-4" />
          Novo Produto
        </button>

        <label className="flex items-center gap-2 text-xs text-neutral-600">
          <span>Alerta estoque baixo (&le;):</span>
          <input
            type="number"
            min={0}
            value={lowStockThreshold}
            onChange={(e) => setLowStockThreshold(Number(e.target.value))}
            className="h-8 w-16 rounded-[2px] border border-neutral-300 px-2 text-xs"
          />
        </label>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="grid gap-4 rounded-[2px] border border-neutral-200 bg-neutral-0 p-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600">
              Nome
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 h-9 w-full rounded-[2px] border border-neutral-300 px-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600">
              Preço (R$)
            </label>
            <input
              type="text"
              value={priceReais}
              onChange={(e) => setPriceReais(e.target.value)}
              required
              className="mt-1 h-9 w-full rounded-[2px] border border-neutral-300 px-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600">
              Estoque inicial
            </label>
            <input
              type="number"
              min={0}
              value={stockQuantity}
              onChange={(e) => setStockQuantity(e.target.value)}
              required
              className="mt-1 h-9 w-full rounded-[2px] border border-neutral-300 px-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600">
              Descrição
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 h-9 w-full rounded-[2px] border border-neutral-300 px-2 text-sm"
            />
          </div>
          <div className="sm:col-span-2 lg:col-span-4 flex gap-2">
            <button
              type="submit"
              disabled={isPending}
              className="h-9 rounded-[2px] bg-neutral-900 px-4 text-xs font-bold uppercase tracking-wider text-neutral-0 hover:bg-neutral-800 disabled:opacity-50"
            >
              {isPending ? "Salvando..." : "Salvar Produto"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="h-9 rounded-[2px] border border-neutral-300 px-4 text-xs font-bold uppercase tracking-wider text-neutral-700 hover:bg-neutral-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto rounded-[2px] border border-neutral-200 bg-neutral-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
            <tr>
              <th className="px-4 py-2.5">Produto</th>
              <th className="px-4 py-2.5">Preço</th>
              <th className="px-4 py-2.5">Estoque</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {products.map((p) => {
              const low = p.stockQuantity <= lowStockThreshold;
              return (
                <tr key={p.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-2.5 font-medium">{p.name}</td>
                  <td className="px-4 py-2.5 font-semibold">
                    {formatCents(p.priceCents)}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        disabled={isPending || p.stockQuantity <= 0}
                        onClick={() =>
                          handleStockChange(p.id, p.stockQuantity - 1)
                        }
                        className="h-6 w-6 rounded-[2px] border border-neutral-300 text-xs hover:bg-neutral-100 disabled:opacity-40"
                      >
                        -
                      </button>
                      <span className="font-mono text-xs w-8 text-center">
                        {p.stockQuantity}
                      </span>
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() =>
                          handleStockChange(p.id, p.stockQuantity + 1)
                        }
                        className="h-6 w-6 rounded-[2px] border border-neutral-300 text-xs hover:bg-neutral-100"
                      >
                        +
                      </button>
                      {low && (
                        <span className="inline-flex items-center gap-1 rounded-[2px] bg-amber-50 px-1.5 py-0.5 text-[11px] font-medium text-amber-700">
                          <AlertTriangle className="h-3 w-3" /> Baixo
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-xs">
                    {p.isActive ? "Ativo" : "Inativo"}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleToggle(p.id, p.isActive)}
                      className="text-xs font-semibold text-neutral-700 hover:underline"
                    >
                      {p.isActive ? "Desativar" : "Ativar"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
