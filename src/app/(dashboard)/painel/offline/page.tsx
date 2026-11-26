import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { SeraCard } from "@/components/shared/sera-card";

export default function OfflinePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Modo Offline"
        description="Informações sobre o funcionamento sem conexão com o servidor local."
        actions={
          <Link
            href="/painel"
            className="inline-flex h-8 items-center rounded-[2px] border border-neutral-200 bg-neutral-0 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-700 hover:bg-neutral-50"
          >
            Voltar ao Painel
          </Link>
        }
      />

      <div className="grid gap-6 md:grid-cols-2">
        <SeraCard title="Disponível Offline">
          <ul className="list-disc space-y-1.5 pl-4 text-sm text-neutral-700">
            <li>Navegação em páginas já visitadas e em cache.</li>
            <li>Criação de rascunhos locais de avisos e chamadas.</li>
          </ul>
        </SeraCard>

        <SeraCard title="Exige Conexão Local">
          <ul className="list-disc space-y-1.5 pl-4 text-sm text-neutral-700">
            <li>Salvar dados no PostgreSQL local.</li>
            <li>Módulo Financeiro, Auditoria e Relatórios.</li>
          </ul>
        </SeraCard>
      </div>
    </div>
  );
}
