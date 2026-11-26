import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { SeraCard } from "@/components/shared/sera-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate } from "@/lib/format";
import { requirePermission } from "@/lib/session";
import { getAssetById } from "@/server/queries/assets";

export default async function PatrimonioFichaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission("membros", "ver");
  const { id } = await params;
  const data = await getAssetById(id);
  if (!data) notFound();

  const { asset, movements } = data;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${asset.patrimonyCode} · ${asset.name}`}
        description={`Local: ${asset.locationText ?? "—"} · Categoria: ${asset.category}`}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge label={asset.condition} variant="info" />
            <Link
              href={`/patrimonio/${id}/etiqueta`}
              className="inline-flex h-8 items-center rounded-[2px] border border-neutral-200 bg-neutral-0 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-800 hover:bg-neutral-50"
            >
              Etiqueta
            </Link>
          </div>
        }
      />

      <SeraCard title={`Movimentações (${movements.length})`}>
        {movements.length === 0 ? (
          <EmptyState
            title="Sem movimentações"
            description="Transferências, manutenções e empréstimos aparecerão aqui."
          />
        ) : (
          <ul className="divide-y divide-neutral-200 text-xs">
            {movements.map((m) => (
              <li
                key={m.id}
                className="flex items-center justify-between py-2"
              >
                <span>
                  <strong>{m.kind}</strong> · {m.fromLocation ?? "—"} →{" "}
                  {m.toLocation ?? "—"} ({m.notes ?? ""})
                </span>
                <span className="font-mono text-neutral-500">
                  {formatDate(m.createdAt, "dd/MM/yyyy HH:mm")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </SeraCard>
    </div>
  );
}
