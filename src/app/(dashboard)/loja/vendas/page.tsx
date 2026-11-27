import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { requireSession } from "@/lib/session";
import { getStoreSales } from "@/server/queries/store";
import { VendasClient } from "./vendas-client";

export default async function LojaVendasPage() {
  await requireSession();
  const sales = await getStoreSales();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vendas — Loja e Cantina"
        description="Histórico de vendas locais e vínculo com o Financeiro."
        actions={
          <div className="flex gap-2">
            <Link
              href="/loja/vender"
              className="inline-flex h-8 items-center rounded-[2px] bg-neutral-900 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-0 hover:bg-neutral-800"
            >
              Abrir PDV
            </Link>
            <Link
              href="/loja/produtos"
              className="inline-flex h-8 items-center rounded-[2px] border border-neutral-200 bg-neutral-0 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-700 hover:bg-neutral-50"
            >
              Produtos
            </Link>
          </div>
        }
      />

      <VendasClient sales={sales} />
    </div>
  );
}
