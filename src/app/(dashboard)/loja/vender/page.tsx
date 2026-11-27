import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { requireSession } from "@/lib/session";
import { getStoreProducts } from "@/server/queries/store";
import { PdvClient } from "./pdv-client";

export default async function LojaVenderPage() {
  await requireSession();
  const products = await getStoreProducts(true);

  return (
    <div className="space-y-6">
      <PageHeader
        title="PDV — Loja e Cantina"
        description="Registro rápido de vendas locais. Sem pagamento online."
        actions={
          <div className="flex gap-2">
            <Link
              href="/loja/produtos"
              className="inline-flex h-8 items-center rounded-[2px] border border-neutral-200 bg-neutral-0 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-700 hover:bg-neutral-50"
            >
              Produtos
            </Link>
            <Link
              href="/loja/vendas"
              className="inline-flex h-8 items-center rounded-[2px] border border-neutral-200 bg-neutral-0 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-700 hover:bg-neutral-50"
            >
              Vendas
            </Link>
          </div>
        }
      />

      <PdvClient products={products} />
    </div>
  );
}
