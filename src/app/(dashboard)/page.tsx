import { Layers } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SeraCard } from "@/components/shared/sera-card";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";

export default function HomePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Fundação do Sistema"
        description="Estrutura base, Design System Sera e conexão local configurados."
        actions={<StatusBadge label="Prompt 0 · Fundação" variant="info" />}
      />

      <SeraCard
        title="Estado da Aplicação"
        description="Nenhum módulo de negócio foi implementado ainda."
        footer="Próximo passo: Prompt 1 (Autenticação, usuários, papéis e permissões)."
      >
        <EmptyState
          icon={Layers}
          title="Ambiente local pronto"
          description="O layout base Sera, o banco PostgreSQL local com Drizzle ORM e a estrutura de pastas estão prontos para receber os módulos."
        />
      </SeraCard>
    </div>
  );
}
