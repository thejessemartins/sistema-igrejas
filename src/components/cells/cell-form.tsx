"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SeraCard } from "@/components/shared/sera-card";
import { WEEKDAYS } from "@/lib/validations";
import { createCell, updateCell } from "@/server/actions/cells";

export interface CellFormValues {
  id?: string;
  name?: string;
  leaderMemberId?: string;
  coLeaderMemberId?: string | null;
  weekday?: number;
  meetingTime?: string;
  addressStreet?: string | null;
  addressDistrict?: string | null;
  addressCity?: string | null;
  isActive?: boolean;
}

export function CellForm({
  initial,
  membersList,
}: {
  initial?: CellFormValues;
  membersList: Array<{ id: string; fullName: string }>;
}) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? "");
  const [leaderMemberId, setLeaderMemberId] = useState(
    initial?.leaderMemberId ?? membersList[0]?.id ?? ""
  );
  const [coLeaderMemberId, setCoLeaderMemberId] = useState(
    initial?.coLeaderMemberId ?? ""
  );
  const [weekday, setWeekday] = useState(String(initial?.weekday ?? 3));
  const [meetingTime, setMeetingTime] = useState(initial?.meetingTime ?? "20:00");
  const [addressStreet, setAddressStreet] = useState(
    initial?.addressStreet ?? ""
  );
  const [addressDistrict, setAddressDistrict] = useState(
    initial?.addressDistrict ?? ""
  );
  const [addressCity, setAddressCity] = useState(initial?.addressCity ?? "");
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const payload = {
      name,
      leaderMemberId,
      coLeaderMemberId: coLeaderMemberId || null,
      weekday: Number(weekday),
      meetingTime,
      addressStreet,
      addressDistrict,
      addressCity,
      isActive,
    };

    const res = initial?.id
      ? await updateCell(initial.id, payload)
      : await createCell(payload);

    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }

    if (initial?.id) {
      router.push(`/celulas/${initial.id}`);
    } else if ("data" in res && res.data?.id) {
      router.push(`/celulas/${res.data.id}`);
    } else {
      router.push("/celulas");
    }
    router.refresh();
  }

  return (
    <SeraCard title="Dados da Célula">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error ? (
          <div className="rounded-[2px] border border-red-600/30 bg-red-600/10 px-3 py-2 text-xs text-red-600">
            {error}
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600">
              Nome *
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border-b border-neutral-300 bg-transparent py-1.5 text-sm focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600">
              Líder *
            </label>
            <select
              required
              value={leaderMemberId}
              onChange={(e) => setLeaderMemberId(e.target.value)}
              className="w-full border-b border-neutral-300 bg-transparent py-1.5 text-sm focus:border-blue-600 focus:outline-none"
            >
              {membersList.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.fullName}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600">
              Vice-líder
            </label>
            <select
              value={coLeaderMemberId}
              onChange={(e) => setCoLeaderMemberId(e.target.value)}
              className="w-full border-b border-neutral-300 bg-transparent py-1.5 text-sm focus:border-blue-600 focus:outline-none"
            >
              <option value="">Nenhum</option>
              {membersList.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.fullName}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600">
              Dia da Semana *
            </label>
            <select
              value={weekday}
              onChange={(e) => setWeekday(e.target.value)}
              className="w-full border-b border-neutral-300 bg-transparent py-1.5 text-sm focus:border-blue-600 focus:outline-none"
            >
              {WEEKDAYS.map((d, idx) => (
                <option key={d} value={idx}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600">
              Horário *
            </label>
            <input
              type="time"
              required
              value={meetingTime}
              onChange={(e) => setMeetingTime(e.target.value)}
              className="w-full border-b border-neutral-300 bg-transparent py-1.5 text-sm focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600">
              Bairro
            </label>
            <input
              value={addressDistrict}
              onChange={(e) => setAddressDistrict(e.target.value)}
              className="w-full border-b border-neutral-300 bg-transparent py-1.5 text-sm focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600">
              Endereço
            </label>
            <input
              value={addressStreet}
              onChange={(e) => setAddressStreet(e.target.value)}
              className="w-full border-b border-neutral-300 bg-transparent py-1.5 text-sm focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600">
              Cidade
            </label>
            <input
              value={addressCity}
              onChange={(e) => setAddressCity(e.target.value)}
              className="w-full border-b border-neutral-300 bg-transparent py-1.5 text-sm focus:border-blue-600 focus:outline-none"
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-xs text-neutral-700">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          Célula ativa
        </label>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-9 items-center rounded-[2px] bg-blue-600 px-5 text-[11px] font-bold uppercase tracking-wider text-neutral-0 hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Salvando..." : "Salvar célula"}
        </button>
      </form>
    </SeraCard>
  );
}
