"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SeraCard } from "@/components/shared/sera-card";
import { EVENT_TYPE_LABELS, EVENT_TYPES, type EventType } from "@/lib/event-constants";
import { createEvent, updateEvent } from "@/server/actions/events";

export interface EventFormValues {
  id?: string;
  title?: string;
  eventType?: string;
  startsAt?: string;
  endsAt?: string | null;
  location?: string | null;
  theme?: string | null;
  preacherText?: string | null;
  preacherMemberId?: string | null;
  description?: string | null;
}

export function EventForm({
  initial,
  membersList,
}: {
  initial?: EventFormValues;
  membersList: Array<{ id: string; fullName: string }>;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [eventType, setEventType] = useState<EventType>(
    (initial?.eventType as EventType) ?? "culto_domingo"
  );
  const [startsAt, setStartsAt] = useState(initial?.startsAt ?? "");
  const [endsAt, setEndsAt] = useState(initial?.endsAt ?? "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [theme, setTheme] = useState(initial?.theme ?? "");
  const [preacherMemberId, setPreacherMemberId] = useState(
    initial?.preacherMemberId ?? ""
  );
  const [preacherText, setPreacherText] = useState(
    initial?.preacherText ?? ""
  );
  const [description, setDescription] = useState(initial?.description ?? "");
  const [repeatWeeks, setRepeatWeeks] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const payload = {
      title,
      eventType,
      startsAt,
      endsAt: endsAt || null,
      location,
      theme,
      preacherMemberId: preacherMemberId || null,
      preacherText,
      description,
      repeatWeeks: initial?.id ? 1 : repeatWeeks,
    };

    const res = initial?.id
      ? await updateEvent(initial.id, payload)
      : await createEvent(payload);

    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }

    if (initial?.id) {
      router.push(`/cultos/${initial.id}`);
    } else if ("data" in res && res.data?.id) {
      router.push(`/cultos/${res.data.id}`);
    } else {
      router.push("/cultos");
    }
    router.refresh();
  }

  return (
    <SeraCard title="Dados do Culto / Evento">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error ? (
          <div className="rounded-[2px] border border-red-600/30 bg-red-600/10 px-3 py-2 text-xs text-red-600">
            {error}
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1 sm:col-span-2">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600">
              Título *
            </label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border-b border-neutral-300 bg-transparent py-1.5 text-sm focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600">
              Tipo *
            </label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value as EventType)}
              className="w-full border-b border-neutral-300 bg-transparent py-1.5 text-sm focus:border-blue-600 focus:outline-none"
            >
              {EVENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {EVENT_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600">
              Início *
            </label>
            <input
              type="datetime-local"
              required
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              className="w-full border-b border-neutral-300 bg-transparent py-1.5 text-sm focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600">
              Término
            </label>
            <input
              type="datetime-local"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              className="w-full border-b border-neutral-300 bg-transparent py-1.5 text-sm focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600">
              Local
            </label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Templo Principal"
              className="w-full border-b border-neutral-300 bg-transparent py-1.5 text-sm focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600">
              Tema
            </label>
            <input
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="w-full border-b border-neutral-300 bg-transparent py-1.5 text-sm focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600">
              Pregador (Membro)
            </label>
            <select
              value={preacherMemberId}
              onChange={(e) => setPreacherMemberId(e.target.value)}
              className="w-full border-b border-neutral-300 bg-transparent py-1.5 text-sm focus:border-blue-600 focus:outline-none"
            >
              <option value="">Outro / Convidado</option>
              {membersList.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.fullName}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600">
              Pregador (Texto livre)
            </label>
            <input
              value={preacherText}
              onChange={(e) => setPreacherText(e.target.value)}
              className="w-full border-b border-neutral-300 bg-transparent py-1.5 text-sm focus:border-blue-600 focus:outline-none"
            />
          </div>

          {!initial?.id ? (
            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600">
                Repetir semanalmente (ocorrências)
              </label>
              <input
                type="number"
                min={1}
                max={52}
                value={repeatWeeks}
                onChange={(e) => setRepeatWeeks(Number(e.target.value) || 1)}
                className="w-full border-b border-neutral-300 bg-transparent py-1.5 text-sm focus:border-blue-600 focus:outline-none"
              />
            </div>
          ) : null}

          <div className="space-y-1 sm:col-span-2 lg:col-span-3">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600">
              Descrição
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-[2px] border border-neutral-300 bg-transparent p-2 text-sm focus:border-blue-600 focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-9 items-center rounded-[2px] bg-blue-600 px-5 text-[11px] font-bold uppercase tracking-wider text-neutral-0 hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Salvando..." : "Salvar evento"}
        </button>
      </form>
    </SeraCard>
  );
}
