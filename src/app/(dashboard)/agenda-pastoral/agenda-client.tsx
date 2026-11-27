"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createPastoralAppointment } from "@/server/actions/pastoral";

interface Props {
  pastors: Array<{ id: string; name: string }>;
  appointments: Array<{
    id: string;
    personName: string;
    reasonCategory: string;
    startsAt: Date;
    endsAt: Date;
    status: string;
  }>;
}

export function AgendaClient({ pastors, appointments }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pastorUserId, setPastorUserId] = useState(pastors[0]?.id ?? "");
  const [personName, setPersonName] = useState("");
  const [reasonCategory, setReasonCategory] = useState("aconselhamento");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    startTransition(async () => {
      const res = await createPastoralAppointment({
        pastorUserId,
        personName,
        reasonCategory,
        startsAt,
        endsAt,
      });
      setFeedback(res.ok ? (res.message ?? "Criado") : res.error);
      if (res.ok) {
        setPersonName("");
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-6">
      {feedback && (
        <div className="rounded-[2px] border border-neutral-200 bg-neutral-50 px-4 py-2 text-sm">
          {feedback}
        </div>
      )}

      {pastors.length > 0 && (
        <form
          onSubmit={handleCreate}
          className="grid gap-3 rounded-[2px] border border-neutral-200 bg-neutral-0 p-4 sm:grid-cols-3"
        >
          <select
            value={pastorUserId}
            onChange={(e) => setPastorUserId(e.target.value)}
            className="h-9 rounded-[2px] border border-neutral-300 bg-neutral-0 px-2 text-sm"
          >
            {pastors.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={personName}
            onChange={(e) => setPersonName(e.target.value)}
            placeholder="Nome do solicitante"
            required
            className="h-9 rounded-[2px] border border-neutral-300 px-2 text-sm"
          />
          <select
            value={reasonCategory}
            onChange={(e) => setReasonCategory(e.target.value)}
            className="h-9 rounded-[2px] border border-neutral-300 bg-neutral-0 px-2 text-sm"
          >
            <option value="aconselhamento">Aconselhamento</option>
            <option value="oracao">Oração</option>
            <option value="familia">Família</option>
            <option value="luto">Luto</option>
            <option value="visita">Visita</option>
            <option value="outro">Outro</option>
          </select>
          <input
            type="datetime-local"
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
            required
            className="h-9 rounded-[2px] border border-neutral-300 px-2 text-sm"
          />
          <input
            type="datetime-local"
            value={endsAt}
            onChange={(e) => setEndsAt(e.target.value)}
            required
            className="h-9 rounded-[2px] border border-neutral-300 px-2 text-sm"
          />
          <button
            type="submit"
            disabled={isPending}
            className="h-9 rounded-[2px] bg-neutral-900 px-4 text-xs font-bold uppercase text-neutral-0"
          >
            Solicitar Atendimento
          </button>
        </form>
      )}

      <div className="overflow-x-auto rounded-[2px] border border-neutral-200 bg-neutral-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-[11px] font-bold uppercase text-neutral-500">
            <tr>
              <th className="px-4 py-2">Horário</th>
              <th className="px-4 py-2">Solicitante</th>
              <th className="px-4 py-2">Categoria</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2 text-right">Detalhes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {appointments.map((a) => (
              <tr key={a.id}>
                <td className="px-4 py-2 text-xs">
                  {new Date(a.startsAt).toLocaleString("pt-BR")}
                </td>
                <td className="px-4 py-2 font-medium">{a.personName}</td>
                <td className="px-4 py-2 capitalize">{a.reasonCategory}</td>
                <td className="px-4 py-2 capitalize">{a.status}</td>
                <td className="px-4 py-2 text-right">
                  <Link
                    href={`/agenda-pastoral/${a.id}`}
                    className="text-xs font-semibold text-neutral-700 hover:underline"
                  >
                    Abrir
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
