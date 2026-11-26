import { PageHeader } from "@/components/shared/page-header";
import { requirePermission } from "@/lib/session";
import { getChurchSettings } from "@/server/actions/settings";
import { ChurchSettingsForm } from "./church-settings-form";

export default async function IgrejaConfigPage() {
  await requirePermission("permissoes", "ver");
  const initial = await getChurchSettings();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configurações da Igreja"
        description="Dados institucionais usados nos relatórios e cabeçalhos."
      />
      <ChurchSettingsForm initial={initial} />
    </div>
  );
}
