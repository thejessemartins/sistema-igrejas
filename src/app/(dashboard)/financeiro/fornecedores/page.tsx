import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { hasPermission } from "@/lib/permissions";
import { requirePermission } from "@/lib/session";
import { getSuppliersDashboard } from "@/server/queries/suppliers";
import { FornecedoresClient } from "./fornecedores-client";

export default async function FornecedoresPage() {
  const session = await requirePermission("financeiro", "ver");
  const data = await getSuppliersDashboard();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fornecedores e Contratos"
        description="Cadastro de fornecedores, contratos locais e alertas de vencimento."
        actions={
          <Link
            href="/financeiro"
            className="inline-flex h-8 items-center rounded-[2px] border border-neutral-200 bg-neutral-0 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-700"
          >
            Voltar
          </Link>
        }
      />

      <FornecedoresClient
        suppliers={data.suppliers}
        contracts={data.contracts}
        expiringContracts={data.expiringContracts}
        canManage={hasPermission(session, "financeiro", "criar")}
      />
    </div>
  );
}
