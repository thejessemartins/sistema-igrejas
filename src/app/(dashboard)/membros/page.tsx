import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTableShell } from "@/components/shared/data-table-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { hasPermission } from "@/lib/permissions";
import { requirePermission } from "@/lib/session";
import { MEMBER_STATUSES } from "@/lib/validations";
import { getMembers } from "@/server/queries/members";

const statusVariant: Record<
  string,
  "success" | "neutral" | "warning" | "info" | "danger"
> = {
  ativo: "success",
  inativo: "neutral",
  afastado: "warning",
  transferido: "info",
  falecido: "danger",
};

export default async function MembrosPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string; page?: string }>;
}) {
  const session = await requirePermission("membros", "ver");
  const params = await searchParams;
  const page = Number(params.page) || 1;

  const data = await getMembers({
    search: params.search,
    status: params.status,
    page,
  });

  const canCreate = hasPermission(session, "membros", "criar");
  const canEdit = hasPermission(session, "membros", "editar");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Membros"
        description="Cadastro, busca e acompanhamento de membros."
        actions={
          canCreate ? (
            <Link
              href="/membros/novo"
              className="inline-flex h-8 items-center gap-1.5 rounded-[2px] bg-blue-600 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-0 hover:bg-blue-700"
            >
              <Plus className="h-3.5 w-3.5" />
              Novo Membro
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
                  placeholder="Nome, CPF ou telefone..."
                  className="w-52 bg-transparent text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
                />
              </div>

              <select
                name="status"
                defaultValue={params.status ?? "all"}
                className="h-8 rounded-[2px] border border-neutral-200 bg-neutral-0 px-2 text-xs text-neutral-800"
              >
                <option value="all">Todos os status</option>
                {MEMBER_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                className="inline-flex h-8 items-center rounded-[2px] border border-neutral-200 bg-neutral-0 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-700 hover:bg-neutral-50"
              >
                Filtrar
              </button>
            </div>

            <span className="text-xs text-neutral-500">
              {data.total} membro(s)
            </span>
          </form>
        }
        footer={
          <div className="flex items-center justify-between">
            <span>
              Página {data.page} de {data.totalPages}
            </span>
            <div className="flex items-center gap-2">
              {data.page > 1 ? (
                <Link
                  href={`/membros?page=${data.page - 1}&search=${params.search ?? ""}&status=${params.status ?? "all"}`}
                  className="rounded-[2px] border border-neutral-200 bg-neutral-0 px-2.5 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  Anterior
                </Link>
              ) : null}
              {data.page < data.totalPages ? (
                <Link
                  href={`/membros?page=${data.page + 1}&search=${params.search ?? ""}&status=${params.status ?? "all"}`}
                  className="rounded-[2px] border border-neutral-200 bg-neutral-0 px-2.5 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  Próxima
                </Link>
              ) : null}
            </div>
          </div>
        }
      >
        {data.items.length === 0 ? (
          <div className="p-4">
            <EmptyState
              title="Nenhum membro encontrado"
              description="Ajuste os filtros de busca ou cadastre um novo membro."
            />
          </div>
        ) : (
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-25 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                <th className="px-4 py-2.5">Membro</th>
                <th className="px-4 py-2.5">Telefone</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5">Célula</th>
                <th className="px-4 py-2.5">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {data.items.map((m) => {
                const initials = m.fullName
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase();

                return (
                  <tr key={m.id} className="hover:bg-neutral-25">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2.5">
                        {m.photoPath ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={m.photoPath}
                            alt={m.fullName}
                            className="h-7 w-7 rounded-[2px] object-cover"
                          />
                        ) : (
                          <span className="flex h-7 w-7 items-center justify-center rounded-[2px] bg-blue-50 text-[10px] font-semibold text-blue-700">
                            {initials}
                          </span>
                        )}
                        <Link
                          href={`/membros/${m.id}`}
                          className="font-medium text-neutral-900 hover:text-blue-600"
                        >
                          {m.fullName}
                        </Link>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-neutral-600">
                      {m.phone ?? "—"}
                    </td>
                    <td className="px-4 py-2.5">
                      <StatusBadge
                        label={m.status}
                        variant={statusVariant[m.status] ?? "neutral"}
                      />
                    </td>
                    <td className="px-4 py-2.5 text-xs text-neutral-400">—</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/membros/${m.id}`}
                          className="text-xs font-medium text-blue-600 hover:underline"
                        >
                          Ver
                        </Link>
                        {canEdit ? (
                          <Link
                            href={`/membros/${m.id}/editar`}
                            className="text-xs font-medium text-neutral-600 hover:underline"
                          >
                            Editar
                          </Link>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </DataTableShell>
    </div>
  );
}
