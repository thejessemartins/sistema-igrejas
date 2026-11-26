import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTableShell } from "@/components/shared/data-table-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { MoneyText } from "@/components/shared/money-text";
import { hasPermission } from "@/lib/permissions";
import { requirePermission } from "@/lib/session";
import { ASSET_CATEGORIES, ASSET_CONDITIONS } from "@/lib/validations";
import { getAssets } from "@/server/queries/assets";

export default async function PatrimonioPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string; condition?: string }>;
}) {
  const session = await requirePermission("membros", "ver");
  const params = await searchParams;
  const items = await getAssets(params);
  const canFinance = hasPermission(session, "financeiro", "ver");
  const canCreate = hasPermission(session, "membros", "criar");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Patrimônio"
        description="Inventário de bens, localização e movimentações."
        actions={
          canCreate ? (
            <Link
              href="/patrimonio/novo"
              className="inline-flex h-8 items-center gap-1.5 rounded-[2px] bg-blue-600 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-0 hover:bg-blue-700"
            >
              <Plus className="h-3.5 w-3.5" />
              Novo Bem
            </Link>
          ) : null
        }
      />

      <DataTableShell
        toolbar={
          <form method="GET" className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 rounded-[2px] border border-neutral-200 bg-neutral-25 px-2.5 py-1.5">
              <Search className="h-3.5 w-3.5 text-neutral-400" />
              <input
                name="search"
                defaultValue={params.search ?? ""}
                placeholder="Nome ou código..."
                className="w-44 bg-transparent text-xs focus:outline-none"
              />
            </div>
            <select
              name="category"
              defaultValue={params.category ?? "all"}
              className="h-8 rounded-[2px] border border-neutral-200 bg-neutral-0 px-2 text-xs"
            >
              <option value="all">Todas categorias</option>
              {ASSET_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select
              name="condition"
              defaultValue={params.condition ?? "all"}
              className="h-8 rounded-[2px] border border-neutral-200 bg-neutral-0 px-2 text-xs"
            >
              <option value="all">Todas condições</option>
              {ASSET_CONDITIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="inline-flex h-8 items-center rounded-[2px] border border-neutral-200 bg-neutral-0 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-700"
            >
              Filtrar
            </button>
          </form>
        }
      >
        {items.length === 0 ? (
          <div className="p-4">
            <EmptyState
              title="Nenhum bem encontrado"
              description="Ajuste os filtros ou cadastre um novo bem."
            />
          </div>
        ) : (
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-25 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                <th className="px-4 py-2.5">Código</th>
                <th className="px-4 py-2.5">Bem</th>
                <th className="px-4 py-2.5">Categoria</th>
                <th className="px-4 py-2.5">Local</th>
                <th className="px-4 py-2.5">Condição</th>
                {canFinance ? <th className="px-4 py-2.5">Valor</th> : null}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {items.map((a) => (
                <tr key={a.id} className="hover:bg-neutral-25">
                  <td className="px-4 py-2.5 font-mono text-xs">
                    {a.patrimonyCode}
                  </td>
                  <td className="px-4 py-2.5 font-medium">
                    <Link
                      href={`/patrimonio/${a.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {a.name}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 text-xs">{a.category}</td>
                  <td className="px-4 py-2.5 text-xs">
                    {a.locationText ?? "—"}
                  </td>
                  <td className="px-4 py-2.5">
                    <StatusBadge label={a.condition} variant="info" />
                  </td>
                  {canFinance ? (
                    <td className="px-4 py-2.5">
                      {a.acquisitionValueCents ? (
                        <MoneyText cents={a.acquisitionValueCents} />
                      ) : (
                        "—"
                      )}
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </DataTableShell>
    </div>
  );
}
