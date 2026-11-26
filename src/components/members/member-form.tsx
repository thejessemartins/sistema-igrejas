"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SeraCard } from "@/components/shared/sera-card";
import { MARITAL_STATUSES, MEMBER_STATUSES } from "@/lib/validations";
import { createMember, updateMember } from "@/server/actions/members";

export interface MemberFormValues {
  id?: string;
  fullName?: string;
  birthDate?: string | null;
  cpf?: string | null;
  phone?: string | null;
  email?: string | null;
  addressStreet?: string | null;
  addressNumber?: string | null;
  addressComplement?: string | null;
  addressDistrict?: string | null;
  addressCity?: string | null;
  addressState?: string | null;
  addressZip?: string | null;
  maritalStatus?: string | null;
  baptismDate?: string | null;
  joinedAt?: string | null;
  status?: string;
  notes?: string | null;
}

export function MemberForm({ initial }: { initial?: MemberFormValues }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    const res = initial?.id
      ? await updateMember(initial.id, formData)
      : await createMember(formData);

    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }

    if (initial?.id) {
      router.push(`/membros/${initial.id}`);
    } else if ("data" in res && res.data?.id) {
      router.push(`/membros/${res.data.id}`);
    } else {
      router.push("/membros");
    }
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error ? (
        <div className="rounded-[2px] border border-red-600/30 bg-red-600/10 px-3 py-2 text-xs text-red-600">
          {error}
        </div>
      ) : null}

      <SeraCard title="Dados Pessoais">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1 sm:col-span-2">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600">
              Nome Completo *
            </label>
            <input
              name="fullName"
              required
              defaultValue={initial?.fullName ?? ""}
              className="w-full border-b border-neutral-300 bg-transparent py-1.5 text-sm focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600">
              Data de Nascimento
            </label>
            <input
              type="date"
              name="birthDate"
              defaultValue={initial?.birthDate ?? ""}
              className="w-full border-b border-neutral-300 bg-transparent py-1.5 text-sm focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600">
              CPF
            </label>
            <input
              name="cpf"
              defaultValue={initial?.cpf ?? ""}
              placeholder="Somente dígitos ou formatado"
              className="w-full border-b border-neutral-300 bg-transparent py-1.5 text-sm focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600">
              Estado Civil
            </label>
            <select
              name="maritalStatus"
              defaultValue={initial?.maritalStatus ?? ""}
              className="w-full border-b border-neutral-300 bg-transparent py-1.5 text-sm focus:border-blue-600 focus:outline-none"
            >
              <option value="">Selecione...</option>
              {MARITAL_STATUSES.map((m) => (
                <option key={m} value={m}>
                  {m.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600">
              Foto (JPG/PNG/WebP até 2 MB)
            </label>
            <input
              type="file"
              name="photo"
              accept="image/jpeg,image/png,image/webp"
              className="w-full text-xs text-neutral-600"
            />
          </div>
        </div>
      </SeraCard>

      <SeraCard title="Contato e Endereço">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600">
              Telefone
            </label>
            <input
              name="phone"
              defaultValue={initial?.phone ?? ""}
              className="w-full border-b border-neutral-300 bg-transparent py-1.5 text-sm focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600">
              E-mail
            </label>
            <input
              type="email"
              name="email"
              defaultValue={initial?.email ?? ""}
              className="w-full border-b border-neutral-300 bg-transparent py-1.5 text-sm focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600">
              CEP
            </label>
            <input
              name="addressZip"
              defaultValue={initial?.addressZip ?? ""}
              className="w-full border-b border-neutral-300 bg-transparent py-1.5 text-sm focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600">
              Logradouro
            </label>
            <input
              name="addressStreet"
              defaultValue={initial?.addressStreet ?? ""}
              className="w-full border-b border-neutral-300 bg-transparent py-1.5 text-sm focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600">
              Número
            </label>
            <input
              name="addressNumber"
              defaultValue={initial?.addressNumber ?? ""}
              className="w-full border-b border-neutral-300 bg-transparent py-1.5 text-sm focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600">
              Bairro
            </label>
            <input
              name="addressDistrict"
              defaultValue={initial?.addressDistrict ?? ""}
              className="w-full border-b border-neutral-300 bg-transparent py-1.5 text-sm focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600">
              Cidade
            </label>
            <input
              name="addressCity"
              defaultValue={initial?.addressCity ?? ""}
              className="w-full border-b border-neutral-300 bg-transparent py-1.5 text-sm focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600">
              UF
            </label>
            <input
              name="addressState"
              maxLength={2}
              defaultValue={initial?.addressState ?? ""}
              className="w-full border-b border-neutral-300 bg-transparent py-1.5 text-sm uppercase focus:border-blue-600 focus:outline-none"
            />
          </div>
        </div>
      </SeraCard>

      <SeraCard title="Vida na Igreja e Observações">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600">
              Data de Batismo
            </label>
            <input
              type="date"
              name="baptismDate"
              defaultValue={initial?.baptismDate ?? ""}
              className="w-full border-b border-neutral-300 bg-transparent py-1.5 text-sm focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600">
              Data de Ingresso
            </label>
            <input
              type="date"
              name="joinedAt"
              defaultValue={initial?.joinedAt ?? ""}
              className="w-full border-b border-neutral-300 bg-transparent py-1.5 text-sm focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600">
              Status
            </label>
            <select
              name="status"
              defaultValue={initial?.status ?? "ativo"}
              className="w-full border-b border-neutral-300 bg-transparent py-1.5 text-sm focus:border-blue-600 focus:outline-none"
            >
              {MEMBER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1 sm:col-span-3">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600">
              Observações
            </label>
            <textarea
              name="notes"
              rows={3}
              defaultValue={initial?.notes ?? ""}
              className="w-full rounded-[2px] border border-neutral-300 bg-transparent p-2 text-sm focus:border-blue-600 focus:outline-none"
            />
          </div>
        </div>
      </SeraCard>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-9 items-center rounded-[2px] bg-blue-600 px-5 text-[11px] font-bold uppercase tracking-wider text-neutral-0 hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Salvando..." : "Salvar membro"}
        </button>
      </div>
    </form>
  );
}
