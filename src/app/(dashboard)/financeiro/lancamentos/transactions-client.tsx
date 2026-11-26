"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { SeraCard } from "@/components/shared/sera-card";
import { DataTableShell } from "@/components/shared/data-table-shell";
import { MoneyText } from "@/components/shared/money-text";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { PAYMENT_METHODS, type PaymentMethod } from "@/lib/validations";
import { createTransaction } from "@/server/actions/finance";

export function TransactionsClient({
  items,
  categories,
  membersList,
  canCreate,
}: {
  items: Array<{
    id: string;
    kind: string;
    description: string;
    amountCents: number;
    transactionDate: string;
    categoryName: string;
    memberName: string | null;
    isAnonymous: boolean;
  }>;
  categories: Array<{ id: string; name: string; kind: string }>;
  membersList: Array<{ id: string; fullName: string }>;
  canCreate: boolean;
}) {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [kind, setKind] = useState<"receita" | "despesa">("receita");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [memberId, setMemberId] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [description, setDescription] = useState("");
  const [amountReais, setAmountReais] = useState("");
  const [transactionDate, setTransactionDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("dinheiro");
  const [supplierText, setSupplierText] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);

    const parsedFloat = Number(amountReais.replace(",", "."));
    const amountCents = Math.round(parsedFloat * 100);

    const res = await createTransaction({
      kind,
      categoryId,
      memberId: kind === "receita" && !isAnonymous ? memberId || null : null,
      isAnonymous: kind === "receita" ? isAnonymous : false,
      description,
      amountCents,
      transactionDate,
      paymentMethod,
      supplierText: kind === "despesa" ? supplierText : null,
      dueDate: dueDate || null,
      paidAt: dueDate ? null : transactionDate,
    });

    if (!res.ok) return setErr(res.error);
    setMsg(res.message);
    setDescription("");
    setAmountReais("");
    setShowCreate(false);
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

      {canCreate && showCreate ? (
        <SeraCard title="Novo Lançamento">
          <form
            onSubmit={handleCreate}
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
          >
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as "receita" | "despesa")}
              className="h-8 rounded-[2px] border border-neutral-200 bg-neutral-0 px-2 text-xs"
            >
              <option value="receita">Receita</option>
              <option value="despesa">Despesa</option>
            </select>

            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="h-8 rounded-[2px] border border-neutral-200 bg-neutral-0 px-2 text-xs"
            >
              {categories
                .filter((c) => c.kind === kind)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>

            <input
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição"
              className="h-8 rounded-[2px] border border-neutral-200 px-2 text-xs"
            />

            <input
              required
              value={amountReais}
              onChange={(e) => setAmountReais(e.target.value)}
              placeholder="Valor (ex: 150,00)"
              className="h-8 rounded-[2px] border border-neutral-200 px-2 text-xs"
            />

            <input
              type="date"
              required
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              className="h-8 rounded-[2px] border border-neutral-200 px-2 text-xs"
            />

            <select
              value={paymentMethod}
              onChange={(e) =>
                setPaymentMethod(e.target.value as PaymentMethod)
              }
              className="h-8 rounded-[2px] border border-neutral-200 bg-neutral-0 px-2 text-xs"
            >
              {PAYMENT_METHODS.map((pm) => (
                <option key={pm} value={pm}>
                  {pm}
                </option>
              ))}
            </select>

            {kind === "receita" ? (
              <div className="flex items-center gap-2">
                <select
                  disabled={isAnonymous}
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value)}
                  className="h-8 flex-1 rounded-[2px] border border-neutral-200 bg-neutral-0 px-2 text-xs disabled:opacity-50"
                >
                  <option value="">Membro (opcional)</option>
                  {membersList.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fullName}
                    </option>
                  ))}
                </select>
                <label className="flex items-center gap-1 text-xs">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                  />
                  Anônimo
                </label>
              </div>
            ) : (
              <input
                value={supplierText}
                onChange={(e) => setSupplierText(e.target.value)}
                placeholder="Fornecedor"
                className="h-8 rounded-[2px] border border-neutral-200 px-2 text-xs"
              />
            )}

            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              title="Vencimento (opcional, deixa pendente)"
              className="h-8 rounded-[2px] border border-neutral-200 px-2 text-xs"
            />

            <div className="sm:col-span-2 lg:col-span-4">
              <button
                type="submit"
                className="inline-flex h-8 items-center rounded-[2px] bg-blue-600 px-4 text-[11px] font-bold uppercase tracking-wider text-neutral-0 hover:bg-blue-700"
              >
                Salvar lançamento
              </button>
            </div>
          </form>
        </SeraCard>
      ) : null}

      <DataTableShell
        toolbar={
          <div className="flex w-full items-center justify-between">
            <span className="text-xs text-neutral-500">
              {items.length} lançamento(s)
            </span>
            {canCreate ? (
              <button
                type="button"
                onClick={() => setShowCreate((v) => !v)}
                className="inline-flex h-8 items-center gap-1.5 rounded-[2px] bg-blue-600 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-0 hover:bg-blue-700"
              >
                <Plus className="h-3.5 w-3.5" />
                Novo Lançamento
              </button>
            ) : null}
          </div>
        }
      >
        {items.length === 0 ? (
          <div className="p-4">
            <EmptyState
              title="Nenhum lançamento"
              description="Registre receitas e despesas acima."
            />
          </div>
        ) : (
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-25 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                <th className="px-4 py-2.5">Data</th>
                <th className="px-4 py-2.5">Tipo</th>
                <th className="px-4 py-2.5">Categoria</th>
                <th className="px-4 py-2.5">Descrição</th>
                <th className="px-4 py-2.5">Membro</th>
                <th className="px-4 py-2.5">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {items.map((t) => (
                <tr key={t.id} className="hover:bg-neutral-25">
                  <td className="px-4 py-2.5 font-mono text-xs">
                    {t.transactionDate}
                  </td>
                  <td className="px-4 py-2.5">
                    <StatusBadge
                      label={t.kind}
                      variant={t.kind === "receita" ? "success" : "danger"}
                    />
                  </td>
                  <td className="px-4 py-2.5 text-neutral-700">
                    {t.categoryName}
                  </td>
                  <td className="px-4 py-2.5 font-medium text-neutral-900">
                    {t.description}
                  </td>
                  <td className="px-4 py-2.5 text-xs text-neutral-600">
                    {t.isAnonymous ? "Anônimo" : t.memberName ?? "—"}
                  </td>
                  <td className="px-4 py-2.5">
                    <MoneyText cents={t.amountCents} />
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
