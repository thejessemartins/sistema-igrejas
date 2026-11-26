"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { SeraCard } from "@/components/shared/sera-card";
import { ASSET_CATEGORIES, ASSET_CONDITIONS } from "@/lib/validations";
import { createAsset } from "@/server/actions/assets";

export default function NovoPatrimonioPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [patrimonyCode, setPatrimonyCode] = useState("");
  const [category, setCategory] = useState<string>("som");
  const [condition, setCondition] = useState<string>("bom");
  const [locationText, setLocationText] = useState("");
  const [err, setErr] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const res = await createAsset({
      name,
      patrimonyCode,
      category,
      condition,
      locationText,
    });
    if (!res.ok) return setErr(res.error);
    if (res.data?.id) router.push(`/patrimonio/${res.data.id}`);
    else router.push("/patrimonio");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Novo Bem Patrimonial"
        actions={
          <Link
            href="/patrimonio"
            className="inline-flex h-8 items-center rounded-[2px] border border-neutral-200 bg-neutral-0 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-700"
          >
            Voltar
          </Link>
        }
      />

      <SeraCard title="Dados do Bem">
        <form onSubmit={handleSubmit} className="space-y-4">
          {err ? (
            <div className="rounded-[2px] border border-red-600/30 bg-red-600/10 px-3 py-2 text-xs text-red-600">
              {err}
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome do bem *"
              className="border-b border-neutral-300 py-1.5 text-sm focus:border-blue-600 focus:outline-none"
            />
            <input
              required
              value={patrimonyCode}
              onChange={(e) => setPatrimonyCode(e.target.value)}
              placeholder="Código (ex: PAT-013) *"
              className="border-b border-neutral-300 py-1.5 text-sm focus:border-blue-600 focus:outline-none"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border-b border-neutral-300 py-1.5 text-sm"
            >
              {ASSET_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="border-b border-neutral-300 py-1.5 text-sm"
            >
              {ASSET_CONDITIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <input
              value={locationText}
              onChange={(e) => setLocationText(e.target.value)}
              placeholder="Localização"
              className="border-b border-neutral-300 py-1.5 text-sm sm:col-span-2"
            />
          </div>

          <button
            type="submit"
            className="inline-flex h-9 items-center rounded-[2px] bg-blue-600 px-5 text-[11px] font-bold uppercase tracking-wider text-neutral-0 hover:bg-blue-700"
          >
            Salvar bem
          </button>
        </form>
      </SeraCard>
    </div>
  );
}
