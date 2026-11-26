"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { SeraCard } from "@/components/shared/sera-card";
import { createSermon } from "@/server/actions/sermons";

export default function NovoSermaoPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [preacherText, setPreacherText] = useState("");
  const [preachedAt, setPreachedAt] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [bibleReference, setBibleReference] = useState("");
  const [seriesName, setSeriesName] = useState("");
  const [summary, setSummary] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const res = await createSermon({
      title,
      preacherText,
      preachedAt,
      bibleReference,
      seriesName,
      summary,
      isPublished,
    });
    if (!res.ok) return setErr(res.error);
    router.push("/sermoes");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Novo Sermão"
        actions={
          <Link
            href="/sermoes"
            className="inline-flex h-8 items-center rounded-[2px] border border-neutral-200 bg-neutral-0 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-700"
          >
            Voltar
          </Link>
        }
      />

      <SeraCard title="Dados do Sermão">
        <form onSubmit={handleSubmit} className="space-y-4">
          {err ? (
            <div className="rounded-[2px] border border-red-600/30 bg-red-600/10 px-3 py-2 text-xs text-red-600">
              {err}
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título *"
              className="border-b border-neutral-300 py-1.5 text-sm sm:col-span-2"
            />
            <input
              value={preacherText}
              onChange={(e) => setPreacherText(e.target.value)}
              placeholder="Pregador"
              className="border-b border-neutral-300 py-1.5 text-sm"
            />
            <input
              type="date"
              required
              value={preachedAt}
              onChange={(e) => setPreachedAt(e.target.value)}
              className="border-b border-neutral-300 py-1.5 text-sm"
            />
            <input
              value={bibleReference}
              onChange={(e) => setBibleReference(e.target.value)}
              placeholder="Referência bíblica (ex: João 3:16)"
              className="border-b border-neutral-300 py-1.5 text-sm"
            />
            <input
              value={seriesName}
              onChange={(e) => setSeriesName(e.target.value)}
              placeholder="Série"
              className="border-b border-neutral-300 py-1.5 text-sm"
            />
            <textarea
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Resumo / Esboço"
              className="rounded-[2px] border border-neutral-300 p-2 text-sm sm:col-span-2"
            />
          </div>

          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
            />
            Publicado para todos
          </label>

          <button
            type="submit"
            className="inline-flex h-9 items-center rounded-[2px] bg-blue-600 px-5 text-[11px] font-bold uppercase tracking-wider text-neutral-0 hover:bg-blue-700"
          >
            Salvar sermão
          </button>
        </form>
      </SeraCard>
    </div>
  );
}
