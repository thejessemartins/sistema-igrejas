"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { SeraCard } from "@/components/shared/sera-card";
import { createPrayerRequest } from "@/server/actions/prayer";

export default function NovoPedidoOracaoPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [visibility, setVisibility] = useState<
    "publico" | "intercessores" | "pastoral"
  >("publico");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const res = await createPrayerRequest({
      title,
      body,
      visibility,
      isAnonymous,
    });
    if (!res.ok) return setErr(res.error);
    router.push("/oracao");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Novo Pedido de Oração"
        actions={
          <Link
            href="/oracao"
            className="inline-flex h-8 items-center rounded-[2px] border border-neutral-200 bg-neutral-0 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-700"
          >
            Voltar
          </Link>
        }
      />

      <SeraCard title="Pedido">
        <form onSubmit={handleSubmit} className="space-y-4">
          {err ? (
            <div className="rounded-[2px] border border-red-600/30 bg-red-600/10 px-3 py-2 text-xs text-red-600">
              {err}
            </div>
          ) : null}

          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título do pedido *"
            className="w-full border-b border-neutral-300 py-1.5 text-sm"
          />

          <select
            value={visibility}
            onChange={(e) =>
              setVisibility(
                e.target.value as "publico" | "intercessores" | "pastoral"
              )
            }
            className="w-full border-b border-neutral-300 py-1.5 text-sm"
          >
            <option value="publico">Público (todos os usuários)</option>
            <option value="intercessores">Intercessores</option>
            <option value="pastoral">Pastoral (apenas pastor e admin)</option>
          </select>

          <textarea
            required
            rows={4}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Descreva seu pedido de oração..."
            className="w-full rounded-[2px] border border-neutral-300 p-2 text-sm"
          />

          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
            />
            Enviar como anônimo (nome visível apenas para nível pastoral)
          </label>

          <button
            type="submit"
            className="inline-flex h-9 items-center rounded-[2px] bg-blue-600 px-5 text-[11px] font-bold uppercase tracking-wider text-neutral-0 hover:bg-blue-700"
          >
            Enviar pedido
          </button>
        </form>
      </SeraCard>
    </div>
  );
}
