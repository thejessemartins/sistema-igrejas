"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  addTripPassenger,
  removeTripPassenger,
  togglePassengerBoarded,
} from "@/server/actions/transport";

export function ViagemClient({
  tripId,
  capacity,
  passengers,
}: {
  tripId: string;
  capacity: number;
  passengers: Array<{
    id: string;
    personName: string;
    phone: string | null;
    boarded: boolean;
  }>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [personName, setPersonName] = useState("");
  const [phone, setPhone] = useState("");
  const [err, setErr] = useState<string | null>(null);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    startTransition(async () => {
      const res = await addTripPassenger(tripId, personName, phone);
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      setPersonName("");
      setPhone("");
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {err && (
        <div className="rounded-[2px] border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
          {err}
        </div>
      )}

      <form
        onSubmit={handleAdd}
        className="flex flex-wrap gap-2 rounded-[2px] border border-neutral-200 bg-neutral-0 p-4"
      >
        <input
          type="text"
          value={personName}
          onChange={(e) => setPersonName(e.target.value)}
          placeholder="Nome do passageiro"
          required
          className="h-9 flex-1 min-w-[180px] rounded-[2px] border border-neutral-300 px-2 text-sm"
        />
        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Telefone"
          className="h-9 w-40 rounded-[2px] border border-neutral-300 px-2 text-sm"
        />
        <button
          type="submit"
          disabled={isPending}
          className="h-9 rounded-[2px] bg-neutral-900 px-4 text-xs font-bold uppercase text-neutral-0"
        >
          Adicionar ({passengers.length}/{capacity})
        </button>
      </form>

      <div className="overflow-x-auto rounded-[2px] border border-neutral-200 bg-neutral-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-[11px] font-bold uppercase text-neutral-500">
            <tr>
              <th className="px-4 py-2">Passageiro</th>
              <th className="px-4 py-2">Telefone</th>
              <th className="px-4 py-2">Embarque</th>
              <th className="px-4 py-2 text-right">Remover</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {passengers.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-2 font-medium">{p.personName}</td>
                <td className="px-4 py-2 text-neutral-600">{p.phone ?? "—"}</td>
                <td className="px-4 py-2">
                  <input
                    type="checkbox"
                    checked={p.boarded}
                    disabled={isPending}
                    onChange={(e) =>
                      startTransition(async () => {
                        await togglePassengerBoarded(
                          p.id,
                          e.target.checked,
                          tripId
                        );
                        router.refresh();
                      })
                    }
                  />
                </td>
                <td className="px-4 py-2 text-right">
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() =>
                      startTransition(async () => {
                        await removeTripPassenger(p.id, tripId);
                        router.refresh();
                      })
                    }
                    className="text-xs font-semibold text-red-700 hover:underline"
                  >
                    Remover
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
