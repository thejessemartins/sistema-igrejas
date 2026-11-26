"use client";

import { useState } from "react";
import { SeraCard } from "@/components/shared/sera-card";
import { saveChurchSettings } from "@/server/actions/settings";

export function ChurchSettingsForm({
  initial,
}: {
  initial: {
    churchName?: string;
    legalName?: string | null;
    cnpj?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
  } | null;
}) {
  const [churchName, setChurchName] = useState(
    initial?.churchName ?? "Igreja Local"
  );
  const [legalName, setLegalName] = useState(initial?.legalName ?? "");
  const [cnpj, setCnpj] = useState(initial?.cnpj ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [address, setAddress] = useState(initial?.address ?? "");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setErr(null);
    const res = await saveChurchSettings({
      churchName,
      legalName,
      cnpj,
      email,
      phone,
      address,
    });
    if (!res.ok) return setErr(res.error);
    setMsg(res.message);
  }

  return (
    <SeraCard title="Dados da Igreja">
      <form onSubmit={handleSubmit} className="space-y-4">
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

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600">
              Nome da Igreja *
            </label>
            <input
              required
              value={churchName}
              onChange={(e) => setChurchName(e.target.value)}
              className="w-full border-b border-neutral-300 bg-transparent py-1.5 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600">
              Razão Social
            </label>
            <input
              value={legalName}
              onChange={(e) => setLegalName(e.target.value)}
              className="w-full border-b border-neutral-300 bg-transparent py-1.5 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600">
              CNPJ
            </label>
            <input
              value={cnpj}
              onChange={(e) => setCnpj(e.target.value)}
              className="w-full border-b border-neutral-300 bg-transparent py-1.5 text-sm"
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
              className="w-full border-b border-neutral-300 bg-transparent py-1.5 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600">
              Telefone
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border-b border-neutral-300 bg-transparent py-1.5 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600">
              Endereço
            </label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full border-b border-neutral-300 bg-transparent py-1.5 text-sm"
            />
          </div>
        </div>

        <button
          type="submit"
          className="inline-flex h-9 items-center rounded-[2px] bg-blue-600 px-5 text-[11px] font-bold uppercase tracking-wider text-neutral-0 hover:bg-blue-700"
        >
          Salvar configurações
        </button>
      </form>
    </SeraCard>
  );
}
