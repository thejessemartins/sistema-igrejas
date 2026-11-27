import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { requirePermission } from "@/lib/session";
import { getNeighborhoodStats } from "@/server/queries/neighborhoods";
import { BairrosClient } from "./bairros-client";

export default async function BairrosPage() {
  await requirePermission("relatorios", "ver");
  const groups = await getNeighborhoodStats();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Membros e Células por Bairro"
        description="Agrupamento local baseado apenas no bairro cadastrado no endereço. Nenhuma chamada externa."
        actions={
          <Link
            href="/celulas"
            className="inline-flex h-8 items-center rounded-[2px] border border-neutral-200 bg-neutral-0 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-700"
          >
            Ver Células
          </Link>
        }
      />

      <div className="rounded-[2px] border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-900">
        <strong>Sugestão pastoral:</strong> Observe bairros com alta concentração
        de membros sem célula para abrir novas células ou redistribuir membros
        distantes.
      </div>

      <BairrosClient groups={groups} />
    </div>
  );
}
