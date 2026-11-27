"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  cancelEventRegistration,
  checkInRegistration,
  configureEventRegistration,
  registerForEvent,
} from "@/server/actions/registrations";

interface Props {
  eventId: string;
  config: { capacity: number; priceCents: number; isEnabled: boolean } | null;
  registrations: Array<{
    id: string;
    personName: string;
    phone: string | null;
    status: string;
  }>;
  defaultName: string;
}

export function InscreverClient({
  eventId,
  config,
  registrations,
  defaultName,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [capacity, setCapacity] = useState(String(config?.capacity ?? 50));
  const [personName, setPersonName] = useState(defaultName);
  const [phone, setPhone] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  const confirmedCount = registrations.filter(
    (r) => r.status === "confirmada" || r.status === "compareceu"
  ).length;

  function handleSaveConfig(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await configureEventRegistration({
        eventId,
        capacity: Number(capacity),
      });
      setFeedback(res.ok ? (res.message ?? "Salvo") : res.error);
      router.refresh();
    });
  }

  function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await registerForEvent({ eventId, personName, phone });
      setFeedback(res.ok ? (res.message ?? "Inscrito") : res.error);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {feedback && (
        <div className="rounded-[2px] border border-neutral-200 bg-neutral-50 px-4 py-2 text-sm">
          {feedback}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <form
          onSubmit={handleSaveConfig}
          className="rounded-[2px] border border-neutral-200 bg-neutral-0 p-4 space-y-3"
        >
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-600">
            Configurar Vagas ({confirmedCount}/{config?.capacity ?? "—"})
          </h3>
          <div className="flex gap-2">
            <input
              type="number"
              min={1}
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              className="h-9 w-28 rounded-[2px] border border-neutral-300 px-2 text-sm"
            />
            <button
              type="submit"
              disabled={isPending}
              className="h-9 rounded-[2px] bg-neutral-900 px-4 text-xs font-bold uppercase text-neutral-0"
            >
              Salvar Vagas
            </button>
          </div>
        </form>

        <form
          onSubmit={handleRegister}
          className="rounded-[2px] border border-neutral-200 bg-neutral-0 p-4 space-y-3"
        >
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-600">
            Nova Inscrição
          </h3>
          <div className="grid gap-2 sm:grid-cols-2">
            <input
              type="text"
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
              placeholder="Nome completo"
              required
              className="h-9 rounded-[2px] border border-neutral-300 px-2 text-sm"
            />
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Telefone"
              className="h-9 rounded-[2px] border border-neutral-300 px-2 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="h-9 rounded-[2px] bg-neutral-900 px-4 text-xs font-bold uppercase text-neutral-0"
          >
            Inscrever
          </button>
        </form>
      </div>

      <div className="overflow-x-auto rounded-[2px] border border-neutral-200 bg-neutral-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-[11px] font-bold uppercase text-neutral-500">
            <tr>
              <th className="px-4 py-2">Nome</th>
              <th className="px-4 py-2">Telefone</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {registrations.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-2 font-medium">{r.personName}</td>
                <td className="px-4 py-2 text-neutral-600">{r.phone ?? "—"}</td>
                <td className="px-4 py-2 capitalize">{r.status}</td>
                <td className="px-4 py-2 text-right space-x-2">
                  {r.status === "confirmada" && (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() =>
                        startTransition(async () => {
                          await checkInRegistration(r.id);
                          router.refresh();
                        })
                      }
                      className="text-xs font-semibold text-emerald-700 hover:underline"
                    >
                      Check-in
                    </button>
                  )}
                  {r.status !== "cancelada" && (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() =>
                        startTransition(async () => {
                          await cancelEventRegistration(r.id);
                          router.refresh();
                        })
                      }
                      className="text-xs font-semibold text-red-700 hover:underline"
                    >
                      Cancelar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
