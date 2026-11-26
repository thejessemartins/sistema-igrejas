import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTableShell } from "@/components/shared/data-table-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { hasPermission } from "@/lib/permissions";
import { requirePermission } from "@/lib/session";
import { WEEKDAYS } from "@/lib/validations";
import { getCells } from "@/server/queries/cells";

export default async function CelulasPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string }>;
}) {
  const session = await requirePermission("celulas", "ver");
  const params = await searchParams;

  const items = await getCells({
    search: params.search,
    status:
      params.status === "active" || params.status === "inactive"
        ? params.status
        : "all",
  });

  const canCreate = hasPermission(session, "celulas", "criar");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Células"
        description="Pequenos grupos, líderes, membros e reuniões."
        actions={
          canCreate ? (
            <Link
              href="/celulas/nova"
              className="inline-flex h-8 items-center gap-1.5 rounded-[2px] bg-blue-600 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-0 hover:bg-blue-700"
            >
              <Plus className="h-3.5 w-3.5" />
              Nova Célula
            </Link>
          ) : null
        }
      />

      <DataTableShell
        toolbar={
          <form
            method="GET"
            className="flex w-full flex-wrap items-center justify-between gap-3"
          >
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 rounded-[2px] border border-neutral-200 bg-neutral-25 px-2.5 py-1.5">
                <Search className="h-3.5 w-3.5 text-neutral-400" />
                <input
                  name="search"
                  defaultValue={params.search ?? ""}
                  placeholder="Nome, líder ou bairro..."
                  className="w-52 bg-transparent text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
                />
              </div>

              <select
                name="status"
                defaultValue={params.status ?? "all"}
                className="h-8 rounded-[2px] border border-neutral-200 bg-neutral-0 px-2 text-xs"
              >
                <option value="all">Todas</option>
                <option value="active">Ativas</option>
                <option value="inactive">Inativas</option>
              </select>

              <button
                type="submit"
                className="inline-flex h-8 items-center rounded-[2px] border border-neutral-200 bg-neutral-0 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-700 hover:bg-neutral-50"
              >
                Filtrar
              </button>
            </div>

            <span className="text-xs text-neutral-500">
              {items.length} célula(s)
            </span>
          </form>
        }
      >
        {items.length === 0 ? (
          <div className="p-4">
            <EmptyState
              title="Nenhuma célula encontrada"
              description="Ajuste os filtros ou cadastre uma nova célula."
            />
          </div>
        ) : (
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-25 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                <th className="px-4 py-2.5">Célula</th>
                <th className="px-4 py-2.5">Líder</th>
                <th className="px-4 py-2.5">Dia / Horário</th>
                <th className="px-4 py-2.5">Bairro</th>
                <th className="px-4 py-2.5">Membros</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {items.map((c) => (
                <tr key={c.id} className="hover:bg-neutral-25">
                  <td className="px-4 py-2.5 font-medium text-neutral-900">
                    <Link
                      href={`/celulas/${c.id}`}
                      className="hover:text-blue-600"
                    >
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 text-neutral-700">
                    {c.leaderName}
                  </td>
                  <td className="px-4 py-2.5 text-xs text-neutral-600">
                    {WEEKDAYS[c.weekday] ?? c.weekday} · {c.meetingTime}
                  </td>
                  <td className="px-4 py-2.5 text-neutral-600">
                    {c.addressDistrict ?? "—"}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-neutral-700">
                    {c.activeMembersCount}
                  </td>
                  <td className="px-4 py-2.5">
                    <StatusBadge
                      label={c.isActive ? "Ativa" : "Inativa"}
                      variant={c.isActive ? "success" : "neutral"}
                    />
                  </td>
                  <td className="px-4 py-2.5">
                    <Link
                      href={`/celulas/${c.id}`}
                      className="text-xs font-medium text-blue-600 hover:underline"
                    >
                      Abrir
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </DataTableShell>
    </div>
  );
}
