import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { hasPermission } from "@/lib/permissions";
import { requirePermission } from "@/lib/session";
import { getAccountsPayableReceivable } from "@/server/queries/finance";
import { AccountsClient } from "./accounts-client";

export default async function ContasPage() {
  const session = await requirePermission("financeiro", "ver");
  const data = await getAccountsPayableReceivable();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contas a Pagar e Receber"
        actions={
          <Link
            href="/financeiro"
            className="inline-flex h-8 items-center rounded-[2px] border border-neutral-200 bg-neutral-0 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-700 hover:bg-neutral-50"
          >
            Voltar
          </Link>
        }
      />

      <AccountsClient
        upcoming={data.upcoming}
        overdue={data.overdue}
        settled={data.settled}
        canEdit={hasPermission(session, "financeiro", "editar")}
      />
    </div>
  );
}
