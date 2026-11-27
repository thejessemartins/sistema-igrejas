"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Plus } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import {
  closeSupplierContract,
  createSupplier,
  createSupplierContract,
} from "@/server/actions/suppliers";

interface SupplierRow {
  id: string;
  name: string;
  categoryText: string | null;
  phone: string | null;
  totalPaidCents: number;
}

interface ContractRow {
  id: string;
  supplierId: string;
  supplierName: string;
  title: string;
  startsAt: string;
  endsAt: string | null;
  monthlyValueCents: number | null;
  status: string;
}

export function FornecedoresClient({
  suppliers,
  contracts,
  expiringContracts,
  canManage,
}: {
  suppliers: SupplierRow[];
  contracts: ContractRow[];
  expiringContracts: ContractRow[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [showContractForm, setShowContractForm] = useState(false);
  const [name, setName] = useState("");
  const [categoryText, setCategoryText] = useState("");
  const [phone, setPhone] = useState("");
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id ?? "");
  const [contractTitle, setContractTitle] = useState("");
  const [startsAt, setStartsAt] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [endsAt, setEndsAt] = useState("");

  function handleCreateSupplier(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await createSupplier({ name, categoryText, phone });
      if (res.ok) {
        setName("");
        setCategoryText("");
        setPhone("");
        setShowSupplierForm(false);
        router.refresh();
      }
    });
  }

  function handleCreateContract(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await createSupplierContract({
        supplierId,
        title: contractTitle,
        startsAt,
        endsAt: endsAt || null,
      });
      if (res.ok) {
        setContractTitle("");
        setShowContractForm(false);
        router.refresh();
      }
    });
  }

  function handleCloseContract(id: string) {
    startTransition(async () => {
      await closeSupplierContract(id, "Encerrado manualmente");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {expiringContracts.length > 0 && (
        <div className="rounded-[2px] border border-amber-200 bg-amber-50 p-4 space-y-1">
          <p className="flex items-center gap-2 text-xs font-bold uppercase text-amber-800">
            <AlertTriangle className="h-4 w-4" /> Contratos a vencer
          </p>
          <ul className="text-xs text-amber-900 list-disc pl-5">
            {expiringContracts.map((c) => (
              <li key={c.id}>
                {c.supplierName} — {c.title} (vence em {c.endsAt})
              </li>
            ))}
          </ul>
        </div>
      )}

      {canManage && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setShowSupplierForm((v) => !v)}
            className="inline-flex h-9 items-center gap-1.5 rounded-[2px] bg-neutral-900 px-4 text-xs font-bold uppercase text-neutral-0"
          >
            <Plus className="h-4 w-4" /> Novo Fornecedor
          </button>
          {suppliers.length > 0 && (
            <button
              type="button"
              onClick={() => setShowContractForm((v) => !v)}
              className="inline-flex h-9 items-center gap-1.5 rounded-[2px] border border-neutral-300 px-4 text-xs font-bold uppercase text-neutral-700"
            >
              <Plus className="h-4 w-4" /> Novo Contrato
            </button>
          )}
        </div>
      )}

      {showSupplierForm && (
        <form
          onSubmit={handleCreateSupplier}
          className="grid gap-3 rounded-[2px] border border-neutral-200 bg-neutral-0 p-4 sm:grid-cols-3"
        >
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome do fornecedor"
            required
            className="h-9 rounded-[2px] border border-neutral-300 px-2 text-sm"
          />
          <input
            type="text"
            value={categoryText}
            onChange={(e) => setCategoryText(e.target.value)}
            placeholder="Categoria (ex: som, limpeza)"
            className="h-9 rounded-[2px] border border-neutral-300 px-2 text-sm"
          />
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Telefone"
            className="h-9 rounded-[2px] border border-neutral-300 px-2 text-sm"
          />
          <button
            type="submit"
            disabled={isPending}
            className="h-9 rounded-[2px] bg-neutral-900 px-4 text-xs font-bold uppercase text-neutral-0 sm:col-span-3 w-fit"
          >
            Salvar Fornecedor
          </button>
        </form>
      )}

      {showContractForm && (
        <form
          onSubmit={handleCreateContract}
          className="grid gap-3 rounded-[2px] border border-neutral-200 bg-neutral-0 p-4 sm:grid-cols-4"
        >
          <select
            value={supplierId}
            onChange={(e) => setSupplierId(e.target.value)}
            className="h-9 rounded-[2px] border border-neutral-300 bg-neutral-0 px-2 text-sm"
          >
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={contractTitle}
            onChange={(e) => setContractTitle(e.target.value)}
            placeholder="Título do contrato"
            required
            className="h-9 rounded-[2px] border border-neutral-300 px-2 text-sm"
          />
          <input
            type="date"
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
            required
            className="h-9 rounded-[2px] border border-neutral-300 px-2 text-sm"
          />
          <input
            type="date"
            value={endsAt}
            onChange={(e) => setEndsAt(e.target.value)}
            className="h-9 rounded-[2px] border border-neutral-300 px-2 text-sm"
          />
          <button
            type="submit"
            disabled={isPending}
            className="h-9 rounded-[2px] bg-neutral-900 px-4 text-xs font-bold uppercase text-neutral-0 sm:col-span-4 w-fit"
          >
            Salvar Contrato
          </button>
        </form>
      )}

      <div className="overflow-x-auto rounded-[2px] border border-neutral-200 bg-neutral-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-[11px] font-bold uppercase text-neutral-500">
            <tr>
              <th className="px-4 py-2">Fornecedor</th>
              <th className="px-4 py-2">Categoria</th>
              <th className="px-4 py-2">Telefone</th>
              <th className="px-4 py-2">Total Pago</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {suppliers.map((s) => (
              <tr key={s.id}>
                <td className="px-4 py-2 font-medium">{s.name}</td>
                <td className="px-4 py-2 text-neutral-600">
                  {s.categoryText ?? "—"}
                </td>
                <td className="px-4 py-2 text-neutral-600">{s.phone ?? "—"}</td>
                <td className="px-4 py-2 font-semibold">
                  {formatCurrency(s.totalPaidCents)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="overflow-x-auto rounded-[2px] border border-neutral-200 bg-neutral-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-[11px] font-bold uppercase text-neutral-500">
            <tr>
              <th className="px-4 py-2">Contrato</th>
              <th className="px-4 py-2">Fornecedor</th>
              <th className="px-4 py-2">Vigência</th>
              <th className="px-4 py-2">Status</th>
              {canManage && <th className="px-4 py-2 text-right">Ação</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {contracts.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-2 font-medium">{c.title}</td>
                <td className="px-4 py-2 text-neutral-600">{c.supplierName}</td>
                <td className="px-4 py-2 text-xs">
                  {c.startsAt} → {c.endsAt ?? "Indeterminado"}
                </td>
                <td className="px-4 py-2 capitalize">{c.status}</td>
                {canManage && (
                  <td className="px-4 py-2 text-right">
                    {c.status === "ativo" && (
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleCloseContract(c.id)}
                        className="text-xs font-semibold text-red-700 hover:underline"
                      >
                        Encerrar
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
