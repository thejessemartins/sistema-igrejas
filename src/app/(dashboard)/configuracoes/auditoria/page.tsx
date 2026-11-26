import { PageHeader } from "@/components/shared/page-header";
import { DataTableShell } from "@/components/shared/data-table-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/format";
import { requirePermission } from "@/lib/session";
import { listAuditLogs } from "@/server/queries/audit";

export default async function AuditoriaPage() {
  await requirePermission("auditoria", "ver");
  const logs = await listAuditLogs();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Auditoria"
        description="Registro somente leitura de eventos de autenticação e gestão de usuários."
      />

      <DataTableShell
        toolbar={
          <span className="text-xs font-medium text-neutral-600">
            Últimos {logs.length} registro(s)
          </span>
        }
      >
        {logs.length === 0 ? (
          <div className="p-4">
            <EmptyState
              title="Nenhum evento registrado"
              description="Os eventos de login, logout e alterações de usuários aparecerão aqui."
            />
          </div>
        ) : (
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-25 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                <th className="px-4 py-2.5">Data/Hora</th>
                <th className="px-4 py-2.5">Usuário</th>
                <th className="px-4 py-2.5">Ação</th>
                <th className="px-4 py-2.5">Entidade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-neutral-25">
                  <td className="px-4 py-2.5 font-mono text-xs text-neutral-600">
                    {formatDate(log.createdAt, "dd/MM/yyyy HH:mm")}
                  </td>
                  <td className="px-4 py-2.5 text-neutral-900">
                    {log.userName ?? log.userEmail ?? "Sistema"}
                  </td>
                  <td className="px-4 py-2.5">
                    <StatusBadge label={log.acao} variant="info" />
                  </td>
                  <td className="px-4 py-2.5 text-xs text-neutral-600">
                    {log.entidade}
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
