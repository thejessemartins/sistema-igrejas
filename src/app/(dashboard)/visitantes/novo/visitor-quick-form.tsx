"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SeraCard } from "@/components/shared/sera-card";
import { createVisitor } from "@/server/actions/visitors";

export function VisitorQuickForm({
  membersList,
}: {
  membersList: Array<{ id: string; fullName: string }>;
}) {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [invitedByMemberId, setInvitedByMemberId] = useState("");
  const [invitedByText, setInvitedByText] = useState("");
  const [firstVisitAt, setFirstVisitAt] = useState(
    new Date().toISOString().slice(0, 16)
  );
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(andAnother: boolean) {
    setError(null);
    setSuccess(null);
    setLoading(true);
    const res = await createVisitor({
      fullName,
      phone,
      email,
      invitedByMemberId: invitedByMemberId || null,
      invitedByText,
      firstVisitAt,
      notes,
    });
    setLoading(false);

    if (!res.ok) {
      setError(res.error);
      return;
    }

    if (andAnother) {
      setSuccess(`Visitante "${fullName}" cadastrado!`);
      setFullName("");
      setPhone("");
      setEmail("");
      setInvitedByMemberId("");
      setInvitedByText("");
      setNotes("");
      router.refresh();
    } else if (res.data?.id) {
      router.push(`/visitantes/${res.data.id}`);
      router.refresh();
    } else {
      router.push("/visitantes");
      router.refresh();
    }
  }

  return (
    <SeraCard
      title="Cadastro Rápido de Recepção"
      description="Preencha os dados essenciais do visitante."
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(false);
        }}
        className="space-y-5"
      >
        {error ? (
          <div className="rounded-[2px] border border-red-600/30 bg-red-600/10 px-3 py-2 text-xs text-red-600">
            {error}
          </div>
        ) : null}
        {success ? (
          <div className="rounded-[2px] border border-green-600/30 bg-green-600/10 px-3 py-2 text-xs text-green-600">
            {success}
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1 sm:col-span-2">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600">
              Nome *
            </label>
            <input
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nome do visitante"
              className="w-full border-b border-neutral-300 bg-transparent py-1.5 text-sm focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600">
              Telefone
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(11) 99999-9999"
              className="w-full border-b border-neutral-300 bg-transparent py-1.5 text-sm focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600">
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-b border-neutral-300 bg-transparent py-1.5 text-sm focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600">
              Convidado por (Membro)
            </label>
            <select
              value={invitedByMemberId}
              onChange={(e) => setInvitedByMemberId(e.target.value)}
              className="w-full border-b border-neutral-300 bg-transparent py-1.5 text-sm focus:border-blue-600 focus:outline-none"
            >
              <option value="">Nenhum / Outro</option>
              {membersList.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.fullName}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600">
              Ou quem convidou (Texto livre)
            </label>
            <input
              value={invitedByText}
              onChange={(e) => setInvitedByText(e.target.value)}
              placeholder="Ex: Instagram, amigo..."
              className="w-full border-b border-neutral-300 bg-transparent py-1.5 text-sm focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600">
              Data/Hora da Visita
            </label>
            <input
              type="datetime-local"
              value={firstVisitAt}
              onChange={(e) => setFirstVisitAt(e.target.value)}
              className="w-full border-b border-neutral-300 bg-transparent py-1.5 text-sm focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600">
              Observação
            </label>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border-b border-neutral-300 bg-transparent py-1.5 text-sm focus:border-blue-600 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-9 items-center rounded-[2px] bg-blue-600 px-4 text-[11px] font-bold uppercase tracking-wider text-neutral-0 hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Salvando..." : "Salvar"}
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => submit(true)}
            className="inline-flex h-9 items-center rounded-[2px] border border-neutral-200 bg-neutral-0 px-4 text-[11px] font-bold uppercase tracking-wider text-neutral-800 hover:bg-neutral-50 disabled:opacity-50"
          >
            Salvar e cadastrar outro
          </button>
        </div>
      </form>
    </SeraCard>
  );
}
