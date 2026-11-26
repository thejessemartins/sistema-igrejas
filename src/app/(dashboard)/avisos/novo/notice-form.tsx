"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SeraCard } from "@/components/shared/sera-card";
import { NOTICE_AUDIENCES, NOTICE_PRIORITIES } from "@/lib/validations";
import { createNotice } from "@/server/actions/notices";

export function NoticeForm({
  cellsList,
  ministriesList,
}: {
  cellsList: Array<{ id: string; name: string }>;
  ministriesList: Array<{ id: string; name: string }>;
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audienceType, setAudienceType] = useState<string>("todos");
  const [cellId, setCellId] = useState("");
  const [ministryId, setMinistryId] = useState("");
  const [priority, setPriority] = useState<string>("normal");
  const [publishAt, setPublishAt] = useState(
    new Date().toISOString().slice(0, 16)
  );
  const [expiresAt, setExpiresAt] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const res = await createNotice({
      title,
      body,
      audienceType,
      cellId: audienceType === "celula" ? cellId || null : null,
      ministryId: audienceType === "ministerio" ? ministryId || null : null,
      priority,
      publishAt,
      expiresAt: expiresAt || null,
      isPinned,
    });
    setLoading(false);
    if (!res.ok) return setErr(res.error);
    router.push("/avisos");
    router.refresh();
  }

  return (
    <SeraCard title="Novo Aviso">
      <form onSubmit={handleSubmit} className="space-y-4">
        {err ? (
          <div className="rounded-[2px] border border-red-600/30 bg-red-600/10 px-3 py-2 text-xs text-red-600">
            {err}
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
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
              Audiência
            </label>
            <select
              value={audienceType}
              onChange={(e) => setAudienceType(e.target.value)}
              className="w-full border-b border-neutral-300 bg-transparent py-1.5 text-sm focus:border-blue-600 focus:outline-none"
            >
              {NOTICE_AUDIENCES.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600">
              Prioridade
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full border-b border-neutral-300 bg-transparent py-1.5 text-sm focus:border-blue-600 focus:outline-none"
            >
              {NOTICE_PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {audienceType === "celula" ? (
            <div className="space-y-1 sm:col-span-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600">
                Célula
              </label>
              <select
                value={cellId}
                onChange={(e) => setCellId(e.target.value)}
                className="w-full border-b border-neutral-300 bg-transparent py-1.5 text-sm"
              >
                <option value="">Selecione...</option>
                {cellsList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {audienceType === "ministerio" ? (
            <div className="space-y-1 sm:col-span-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600">
                Ministério
              </label>
              <select
                value={ministryId}
                onChange={(e) => setMinistryId(e.target.value)}
                className="w-full border-b border-neutral-300 bg-transparent py-1.5 text-sm"
              >
                <option value="">Selecione...</option>
                {ministriesList.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600">
              Publicar em
            </label>
            <input
              type="datetime-local"
              value={publishAt}
              onChange={(e) => setPublishAt(e.target.value)}
              className="w-full border-b border-neutral-300 bg-transparent py-1.5 text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600">
              Expira em (opcional)
            </label>
            <input
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full border-b border-neutral-300 bg-transparent py-1.5 text-sm"
            />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600">
              Conteúdo *
            </label>
            <textarea
              required
              rows={4}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full rounded-[2px] border border-neutral-300 bg-transparent p-2 text-sm focus:border-blue-600 focus:outline-none"
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-xs text-neutral-700">
          <input
            type="checkbox"
            checked={isPinned}
            onChange={(e) => setIsPinned(e.target.checked)}
          />
          Fixar no topo do mural
        </label>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-9 items-center rounded-[2px] bg-blue-600 px-5 text-[11px] font-bold uppercase tracking-wider text-neutral-0 hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Publicando..." : "Publicar aviso"}
        </button>
      </form>
    </SeraCard>
  );
}
