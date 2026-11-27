import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { requireSession } from "@/lib/session";
import { getStoreProducts } from "@/server/queries/store";
import { ProdutosClient } from "./produtos-client";

export default async function LojaProdutosPage() {
  await requireSession();
  const products = await getStoreProducts(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Loja e Cantina — Produtos"
        description="Cadastro de produtos e controle de estoque local."
        actions={
          <div className="flex gap-2">
            <Link
              href="/loja/vender"
              className="inline-flex h-8 items-center rounded-[2px] bg-neutral-900 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-0 hover:bg-neutral-800"
            >
              Abrir PDV
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

      <ProdutosClient products={products} />
    </div>
  );
}
