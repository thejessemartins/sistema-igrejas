"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  PauseCircle,
  PlayCircle,
  Plus,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { formatCurrency as formatCents } from "@/lib/format";
import {
  createRecurringCommitment,
  extendRecurringCommitment,
  updateRecurringCommitmentStatus,
} from "@/server/actions/recurring";

interface CommitmentItem {
  id: string;
  memberId: string;
  memberName: string;
  categoryId: string;
  categoryName: string;
  amountCents: number;
  frequency: string;
  dayOfMonth: number | null;
  startsAt: string;
  endsAt: string | null;
  status: string;
  notes: string | null;
}

interface OccurrenceItem {
  id: string;
  commitmentId: string;
  dueDate: string;
  financialTransactionId: string | null;
  memberId: string;
  memberName: string;
  categoryId: string;
  categoryName: string;
  amountCents: number;
  commitmentStatus: string;
}

interface Props {
  commitments: CommitmentItem[];
  monthOccurrences: OccurrenceItem[];
  expectedMonthCents: number;
  confirmedMonthCents: number;
  categories: { id: string; name: string }[];
  membersList: { id: string; fullName: string }[];
  canManage: boolean;
}

export function RecorrentesClient({
  commitments,
  monthOccurrences,
  expectedMonthCents,
  confirmedMonthCents,
  categories,
  membersList,
  canManage,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "ok" | "error";
    text: string;
  } | null>(null);

  const [memberId, setMemberId] = useState(membersList[0]?.id ?? "");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [amountReais, setAmountReais] = useState("100.00");
  const [frequency, setFrequency] = useState<"mensal" | "semanal">("mensal");
  const [dayOfMonth, setDayOfMonth] = useState("10");
  const [startsAt, setStartsAt] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [endsAt, setEndsAt] = useState("");
  const [notes, setNotes] = useState("");

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    const amountCents = Math.round(
      Number(amountReais.replace(",", ".")) * 100
    );

    startTransition(async () => {
      const res = await createRecurringCommitment({
        memberId,
        categoryId,
        amountCents,
        frequency,
        dayOfMonth: frequency === "mensal" ? Number(dayOfMonth) : null,
        startsAt,
        endsAt: endsAt || null,
        notes: notes || null,
      });

      if (!res.ok) {
        setFeedback({ type: "error", text: res.error });
        return;
      }

      setFeedback({ type: "ok", text: res.message ?? "Compromisso criado." });
      setShowForm(false);
      setNotes("");
      router.refresh();
    });
  }

  function handleStatus(id: string, status: "ativo" | "pausado" | "encerrado") {
    setFeedback(null);
    startTransition(async () => {
      const res = await updateRecurringCommitmentStatus(id, status);
      if (!res.ok) {
        setFeedback({ type: "error", text: res.error });
        return;
      }
      setFeedback({ type: "ok", text: res.message ?? "Atualizado." });
      router.refresh();
    });
  }

  function handleExtend(id: string) {
    setFeedback(null);
    startTransition(async () => {
      const res = await extendRecurringCommitment(id);
      if (!res.ok) {
        setFeedback({ type: "error", text: res.error });
        return;
      }
      setFeedback({ type: "ok", text: res.message ?? "Prorrogado." });
      router.refresh();
    });
  }

  const pendingOccurrences = monthOccurrences.filter(
    (o) => !o.financialTransactionId
  );
  const confirmedOccurrences = monthOccurrences.filter(
    (o) => Boolean(o.financialTransactionId)
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-[2px] border border-neutral-200 bg-neutral-0 p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
            Esperado no mês
          </p>
          <p className="mt-1 text-2xl font-bold text-neutral-900">
            {formatCents(expectedMonthCents)}
          </p>
        </div>
        <div className="rounded-[2px] border border-neutral-200 bg-neutral-0 p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
            Confirmado no mês
          </p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">
            {formatCents(confirmedMonthCents)}
          </p>
        </div>
        <div className="rounded-[2px] border border-neutral-200 bg-neutral-0 p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
            Compromissos ativos
          </p>
          <p className="mt-1 text-2xl font-bold text-neutral-900">
            {commitments.filter((c) => c.status === "ativo").length}
          </p>
        </div>
      </div>

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

      {canManage && (
        <div>
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="inline-flex h-9 items-center gap-2 rounded-[2px] bg-neutral-900 px-4 text-xs font-bold uppercase tracking-wider text-neutral-0 hover:bg-neutral-800"
          >
            <Plus className="h-4 w-4" />
            Novo Compromisso
          </button>

          {showForm && (
            <form
              onSubmit={handleCreate}
              className="mt-4 grid gap-4 rounded-[2px] border border-neutral-200 bg-neutral-0 p-4 sm:grid-cols-2 lg:grid-cols-4"
            >
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600">
                  Membro
                </label>
                <select
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value)}
                  required
                  className="mt-1 h-9 w-full rounded-[2px] border border-neutral-300 bg-neutral-0 px-2 text-sm"
                >
                  {membersList.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600">
                  Categoria (Receita)
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
                  className="mt-1 h-9 w-full rounded-[2px] border border-neutral-300 bg-neutral-0 px-2 text-sm"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600">
                  Valor (R$)
                </label>
                <input
                  type="text"
                  value={amountReais}
                  onChange={(e) => setAmountReais(e.target.value)}
                  required
                  className="mt-1 h-9 w-full rounded-[2px] border border-neutral-300 px-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600">
                  Frequência
                </label>
                <select
                  value={frequency}
                  onChange={(e) =>
                    setFrequency(e.target.value as "mensal" | "semanal")
                  }
                  className="mt-1 h-9 w-full rounded-[2px] border border-neutral-300 bg-neutral-0 px-2 text-sm"
                >
                  <option value="mensal">Mensal</option>
                  <option value="semanal">Semanal</option>
                </select>
              </div>

              {frequency === "mensal" && (
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600">
                    Dia do mês
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={dayOfMonth}
                    onChange={(e) => setDayOfMonth(e.target.value)}
                    className="mt-1 h-9 w-full rounded-[2px] border border-neutral-300 px-2 text-sm"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600">
                  Início
                </label>
                <input
                  type="date"
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                  required
                  className="mt-1 h-9 w-full rounded-[2px] border border-neutral-300 px-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600">
                  Fim (opcional)
                </label>
                <input
                  type="date"
                  value={endsAt}
                  onChange={(e) => setEndsAt(e.target.value)}
                  className="mt-1 h-9 w-full rounded-[2px] border border-neutral-300 px-2 text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600">
                  Observações
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Dízimo mensal declarado"
                  className="mt-1 h-9 w-full rounded-[2px] border border-neutral-300 px-2 text-sm"
                />
              </div>

              <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-4">
                <button
                  type="submit"
                  disabled={isPending}
                  className="h-9 rounded-[2px] bg-neutral-900 px-4 text-xs font-bold uppercase tracking-wider text-neutral-0 hover:bg-neutral-800 disabled:opacity-50"
                >
                  {isPending ? "Salvando..." : "Salvar e gerar 12 meses"}
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
        </div>
      )}

      <div className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-700">
          Ocorrências do Mês ({monthOccurrences.length})
        </h2>
        <div className="overflow-x-auto rounded-[2px] border border-neutral-200 bg-neutral-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              <tr>
                <th className="px-4 py-2.5">Vencimento</th>
                <th className="px-4 py-2.5">Membro</th>
                <th className="px-4 py-2.5">Categoria</th>
                <th className="px-4 py-2.5">Valor</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {monthOccurrences.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-center text-neutral-500"
                  >
                    Nenhuma ocorrência prevista para este mês.
                  </td>
                </tr>
              ) : (
                [...pendingOccurrences, ...confirmedOccurrences].map((occ) => {
                  const confirmed = Boolean(occ.financialTransactionId);
                  return (
                    <tr key={occ.id} className="hover:bg-neutral-50">
                      <td className="px-4 py-2.5 font-mono text-xs">
                        {occ.dueDate}
                      </td>
                      <td className="px-4 py-2.5 font-medium">
                        {occ.memberName}
                      </td>
                      <td className="px-4 py-2.5 text-neutral-600">
                        {occ.categoryName}
                      </td>
                      <td className="px-4 py-2.5 font-semibold">
                        {formatCents(occ.amountCents)}
                      </td>
                      <td className="px-4 py-2.5">
                        {confirmed ? (
                          <span className="inline-flex items-center gap-1 rounded-[2px] bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Confirmada
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-[2px] bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                            <Clock className="h-3.5 w-3.5" /> Pendente
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        {!confirmed && canManage ? (
                          <Link
                            href={`/financeiro/lancamentos?occurrenceId=${occ.id}`}
                            className="inline-flex h-7 items-center rounded-[2px] bg-neutral-900 px-2.5 text-[11px] font-bold uppercase tracking-wider text-neutral-0 hover:bg-neutral-800"
                          >
                            Confirmar recebimento
                          </Link>
                        ) : (
                          <span className="text-xs text-neutral-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-700">
          Compromissos Cadastrados ({commitments.length})
        </h2>
        <div className="overflow-x-auto rounded-[2px] border border-neutral-200 bg-neutral-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              <tr>
                <th className="px-4 py-2.5">Membro</th>
                <th className="px-4 py-2.5">Categoria</th>
                <th className="px-4 py-2.5">Valor</th>
                <th className="px-4 py-2.5">Frequência</th>
                <th className="px-4 py-2.5">Status</th>
                {canManage && (
                  <th className="px-4 py-2.5 text-right">Ações</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {commitments.length === 0 ? (
                <tr>
                  <td
                    colSpan={canManage ? 6 : 5}
                    className="px-4 py-6 text-center text-neutral-500"
                  >
                    Nenhum compromisso cadastrado.
                  </td>
                </tr>
              ) : (
                commitments.map((c) => (
                  <tr key={c.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-2.5 font-medium">{c.memberName}</td>
                    <td className="px-4 py-2.5 text-neutral-600">
                      {c.categoryName}
                    </td>
                    <td className="px-4 py-2.5 font-semibold">
                      {formatCents(c.amountCents)}
                    </td>
                    <td className="px-4 py-2.5 capitalize text-neutral-600">
                      {c.frequency}
                      {c.dayOfMonth ? ` (dia ${c.dayOfMonth})` : ""}
                    </td>
                    <td className="px-4 py-2.5 capitalize">{c.status}</td>
                    {canManage && (
                      <td className="px-4 py-2.5 text-right">
                        <div className="inline-flex items-center gap-1">
                          {c.status === "ativo" && (
                            <>
                              <button
                                type="button"
                                disabled={isPending}
                                onClick={() => handleExtend(c.id)}
                                title="Prorrogar 12 meses"
                                className="inline-flex h-7 items-center gap-1 rounded-[2px] border border-neutral-200 px-2 text-xs hover:bg-neutral-100"
                              >
                                <RefreshCw className="h-3.5 w-3.5" />
                                Prorrogar
                              </button>
                              <button
                                type="button"
                                disabled={isPending}
                                onClick={() => handleStatus(c.id, "pausado")}
                                className="inline-flex h-7 items-center gap-1 rounded-[2px] border border-neutral-200 px-2 text-xs hover:bg-neutral-100"
                              >
                                <PauseCircle className="h-3.5 w-3.5" />
                                Pausar
                              </button>
                            </>
                          )}
                          {c.status === "pausado" && (
                            <button
                              type="button"
                              disabled={isPending}
                              onClick={() => handleStatus(c.id, "ativo")}
                              className="inline-flex h-7 items-center gap-1 rounded-[2px] border border-neutral-200 px-2 text-xs hover:bg-neutral-100"
                            >
                              <PlayCircle className="h-3.5 w-3.5" />
                              Reativar
                            </button>
                          )}
                          {c.status !== "encerrado" && (
                            <button
                              type="button"
                              disabled={isPending}
                              onClick={() => handleStatus(c.id, "encerrado")}
                              className="inline-flex h-7 items-center gap-1 rounded-[2px] border border-red-200 px-2 text-xs text-red-700 hover:bg-red-50"
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              Encerrar
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
