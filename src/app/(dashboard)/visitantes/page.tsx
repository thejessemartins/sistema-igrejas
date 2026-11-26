import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTableShell } from "@/components/shared/data-table-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/format";
import { hasPermission } from "@/lib/permissions";
import { requirePermission } from "@/lib/session";
import {
  FOLLOW_UP_LABELS,
  FOLLOW_UP_STATUSES,
  type FollowUpStatus,
} from "@/lib/validations";
import { getVisitors } from "@/server/queries/visitors";

const statusVariant: Record<
  string,
  "info" | "warning" | "success" | "neutral" | "danger"
> = {
  novo: "info",
  em_contato: "warning",
  retornou: "success",
  virou_membro: "success",
  nao_retornou: "neutral",
};

export default async function VisitantesPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }>;
}) {
  const session = await requirePermission("visitantes", "ver");
  const params = await searchParams;

  const items = await getVisitors({
    search: params.search,
    status: params.status,
    startDate: params.startDate,
    endDate: params.endDate,
  });

  const canCreate = hasPermission(session, "visitantes", "criar");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Visitantes"
        description="Recepção, acompanhamento e conversão de visitantes."
        actions={
          canCreate ? (
            <Link
              href="/visitantes/novo"
              className="inline-flex h-8 items-center gap-1.5 rounded-[2px] bg-blue-600 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-0 hover:bg-blue-700"
            >
              <Plus className="h-3.5 w-3.5" />
              Novo Visitante
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
                  placeholder="Nome ou telefone..."
                  className="w-44 bg-transparent text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
                />
              </div>

              <select
                name="status"
                defaultValue={params.status ?? "all"}
                className="h-8 rounded-[2px] border border-neutral-200 bg-neutral-0 px-2 text-xs"
              >
                <option value="all">Todos os status</option>
                {FOLLOW_UP_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {FOLLOW_UP_LABELS[s]}
                  </option>
                ))}
              </select>

              <input
                type="date"
                name="startDate"
                defaultValue={params.startDate ?? ""}
                className="h-8 rounded-[2px] border border-neutral-200 bg-neutral-0 px-2 text-xs"
              />
              <input
                type="date"
                name="endDate"
                defaultValue={params.endDate ?? ""}
                className="h-8 rounded-[2px] border border-neutral-200 bg-neutral-0 px-2 text-xs"
              />

              <button
                type="submit"
                className="inline-flex h-8 items-center rounded-[2px] border border-neutral-200 bg-neutral-0 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-700 hover:bg-neutral-50"
              >
                Filtrar
              </button>
            </div>

            <span className="text-xs text-neutral-500">
              {items.length} visitante(s)
            </span>
          </form>
        }
      >
        {items.length === 0 ? (
          <div className="p-4">
            <EmptyState
              title="Nenhum visitante encontrado"
              description="Ajuste os filtros ou cadastre um novo visitante."
            />
          </div>
        ) : (
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-25 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                <th className="px-4 py-2.5">Nome</th>
                <th className="px-4 py-2.5">Telefone</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5">Visitas</th>
                <th className="px-4 py-2.5">Última Visita</th>
                <th className="px-4 py-2.5">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {items.map((v) => (
                <tr key={v.id} className="hover:bg-neutral-25">
                  <td className="px-4 py-2.5 font-medium text-neutral-900">
                    <Link
                      href={`/visitantes/${v.id}`}
                      className="hover:text-blue-600"
                    >
                      {v.fullName}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 text-neutral-600">
                    {v.phone ?? "—"}
                  </td>
                  <td className="px-4 py-2.5">
                    <StatusBadge
                      label={
                        FOLLOW_UP_LABELS[v.followUpStatus as FollowUpStatus] ??
                        v.followUpStatus
                      }
                      variant={statusVariant[v.followUpStatus] ?? "neutral"}
                    />
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-neutral-700">
                    {v.visitCount}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-neutral-600">
                    {v.lastVisitAt
                      ? formatDate(v.lastVisitAt, "dd/MM/yyyy HH:mm")
                      : formatDate(v.firstVisitAt, "dd/MM/yyyy HH:mm")}
                  </td>
                  <td className="px-4 py-2.5">
                    <Link
                      href={`/visitantes/${v.id}`}
                      className="text-xs font-medium text-blue-600 hover:underline"
                    >
                      Abrir ficha
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
