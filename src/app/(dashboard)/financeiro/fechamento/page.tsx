import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { requirePermission } from "@/lib/session";
import { getMonthlyClosings } from "@/server/queries/finance";
import { ClosingClient } from "./closing-client";

export default async function FechamentoPage() {
  const session = await requirePermission("financeiro", "ver");
  const closings = await getMonthlyClosings();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fechamento Mensal"
        description="Consolide os totais do mês e bloqueie alterações."
        actions={
          <Link
            href="/financeiro"
            className="inline-flex h-8 items-center rounded-[2px] border border-neutral-200 bg-neutral-0 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-700 hover:bg-neutral-50"
          >
            Voltar
          </Link>
        }
      />

      <ClosingClient
        closings={closings}
        isAdmin={session.user.role === "admin"}
      />
    </div>
  );
}
