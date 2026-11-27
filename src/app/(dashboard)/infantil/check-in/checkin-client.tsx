"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  checkInKid,
  checkOutKid,
  createKidWithGuardian,
} from "@/server/actions/kids";

interface Props {
  childrenList: Array<{
    id: string;
    fullName: string;
    allergiesOrRestrictions: string | null;
  }>;
  guardians: Array<{
    id: string;
    childId: string;
    guardianName: string;
    isAuthorizedPickup: boolean;
  }>;
  checkins: Array<{
    id: string;
    childId: string;
    childName: string;
    allergies: string | null;
    pickupCode: string;
    roomText: string | null;
    checkedOutAt: Date | null;
  }>;
  events: Array<{ id: string; title: string }>;
}

export function CheckinClient({
  childrenList,
  guardians,
  checkins,
  events,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [fullName, setFullName] = useState("");
  const [allergies, setAllergies] = useState("");
  const [guardianName, setGuardianName] = useState("");
  const [eventId, setEventId] = useState(events[0]?.id ?? "");
  const [childId, setChildId] = useState(childrenList[0]?.id ?? "");
  const [codeInput, setCodeInput] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<string | null>(null);

  function handleCreateKid(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await createKidWithGuardian({
        fullName,
        allergiesOrRestrictions: allergies || null,
        guardianName,
        isAuthorizedPickup: true,
      });
      setMsg(res.ok ? (res.message ?? "Cadastrado") : res.error);
      setFullName("");
      setAllergies("");
      setGuardianName("");
      router.refresh();
    });
  }

  function handleCheckIn(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await checkInKid(eventId, childId);
      setMsg(res.ok ? (res.message ?? "Check-in feito") : res.error);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {msg && (
        <div className="rounded-[2px] border border-neutral-200 bg-neutral-50 px-4 py-2 text-sm font-medium">
          {msg}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <form
          onSubmit={handleCreateKid}
          className="rounded-[2px] border border-neutral-200 bg-neutral-0 p-4 space-y-3"
        >
          <h3 className="text-xs font-bold uppercase text-neutral-600">
            Cadastrar Criança e Responsável
          </h3>
          <div className="grid gap-2 sm:grid-cols-2">
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nome da criança"
              required
              className="h-9 rounded-[2px] border border-neutral-300 px-2 text-sm"
            />
            <input
              type="text"
              value={guardianName}
              onChange={(e) => setGuardianName(e.target.value)}
              placeholder="Responsável autorizado"
              required
              className="h-9 rounded-[2px] border border-neutral-300 px-2 text-sm"
            />
            <input
              type="text"
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              placeholder="Alergias / restrições (opcional)"
              className="h-9 rounded-[2px] border border-neutral-300 px-2 text-sm sm:col-span-2"
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="h-9 rounded-[2px] bg-neutral-900 px-4 text-xs font-bold uppercase text-neutral-0"
          >
            Cadastrar
          </button>
        </form>

        {events.length > 0 && childrenList.length > 0 && (
          <form
            onSubmit={handleCheckIn}
            className="rounded-[2px] border border-neutral-200 bg-neutral-0 p-4 space-y-3"
          >
            <h3 className="text-xs font-bold uppercase text-neutral-600">
              Fazer Check-in
            </h3>
            <div className="grid gap-2 sm:grid-cols-2">
              <select
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                className="h-9 rounded-[2px] border border-neutral-300 bg-neutral-0 px-2 text-sm"
              >
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title}
                  </option>
                ))}
              </select>
              <select
                value={childId}
                onChange={(e) => setChildId(e.target.value)}
                className="h-9 rounded-[2px] border border-neutral-300 bg-neutral-0 px-2 text-sm"
              >
                {childrenList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.fullName}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={isPending}
              className="h-10 rounded-[2px] bg-neutral-900 px-5 text-xs font-bold uppercase text-neutral-0"
            >
              Confirmar Entrada
            </button>
          </form>
        )}
      </div>

      <div className="overflow-x-auto rounded-[2px] border border-neutral-200 bg-neutral-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-[11px] font-bold uppercase text-neutral-500">
            <tr>
              <th className="px-4 py-2">Criança</th>
              <th className="px-4 py-2">Código</th>
              <th className="px-4 py-2">Alergias</th>
              <th className="px-4 py-2 text-right">Retirada</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {checkins.map((ch) => {
              const childGuardians = guardians.filter(
                (g) => g.childId === ch.childId && g.isAuthorizedPickup
              );
              return (
                <tr key={ch.id}>
                  <td className="px-4 py-2 font-medium">{ch.childName}</td>
                  <td className="px-4 py-2 font-mono text-xs font-bold">
                    {ch.pickupCode}
                  </td>
                  <td className="px-4 py-2 text-xs text-amber-700">
                    {ch.allergies ?? "—"}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {ch.checkedOutAt ? (
                      <span className="text-xs text-emerald-700">Retirada</span>
                    ) : (
                      <div className="inline-flex items-center gap-1">
                        <input
                          type="text"
                          placeholder="Código"
                          value={codeInput[ch.id] ?? ""}
                          onChange={(e) =>
                            setCodeInput((p) => ({
                              ...p,
                              [ch.id]: e.target.value,
                            }))
                          }
                          className="h-7 w-20 rounded-[2px] border border-neutral-300 px-2 text-xs uppercase"
                        />
                        {childGuardians[0] && (
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() =>
                              startTransition(async () => {
                                const res = await checkOutKid(
                                  ch.id,
                                  codeInput[ch.id] ?? "",
                                  childGuardians[0].id
                                );
                                setMsg(
                                  res.ok
                                    ? (res.message ?? "Retirada OK")
                                    : res.error
                                );
                                router.refresh();
                              })
                            }
                            className="h-7 rounded-[2px] bg-neutral-900 px-2.5 text-[11px] font-bold uppercase text-neutral-0"
                          >
                            Confirmar Saída
                          </button>
                        )}
                      </div>
                    )}
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
