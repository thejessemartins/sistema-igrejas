import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SeraCard } from "@/components/shared/sera-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { requireSession } from "@/lib/session";
import { getPrayerRequests } from "@/server/queries/prayer";

export default async function OracaoPage() {
  const session = await requireSession();
  const items = await getPrayerRequests(session);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pedidos de Oração"
        description="Pedidos visíveis conforme seu nível de acesso."
        actions={
          <Link
            href="/oracao/novo"
            className="inline-flex h-8 items-center gap-1.5 rounded-[2px] bg-blue-600 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-0 hover:bg-blue-700"
          >
            <Plus className="h-3.5 w-3.5" />
            Novo Pedido
          </Link>
        }
      />

      {items.length === 0 ? (
        <EmptyState
          title="Nenhum pedido visível"
          description="Os pedidos de oração aparecerão aqui."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((p) => (
            <SeraCard
              key={p.id}
              title={p.title}
              description={`Por: ${p.authorDisplay} · Visibilidade: ${p.visibility}`}
              footer={
                <div className="flex items-center justify-between">
                  <StatusBadge
                    label={p.status}
                    variant={p.status === "atendido" ? "success" : "info"}
                  />
                  <Link
                    href={`/oracao/${p.id}`}
                    className="font-semibold text-blue-600 hover:underline"
                  >
                    Abrir
                  </Link>
                </div>
              }
            >
              <p className="line-clamp-2 text-xs text-neutral-600">{p.body}</p>
            </SeraCard>
          ))}
        </div>
      )}
    </div>
  );
}
