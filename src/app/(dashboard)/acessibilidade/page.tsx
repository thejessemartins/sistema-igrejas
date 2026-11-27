import { PageHeader } from "@/components/shared/page-header";
import { getUserPreferences } from "@/server/actions/preferences";
import { AcessibilidadeClient } from "./acessibilidade-client";

export default async function AcessibilidadePage() {
  const prefs = await getUserPreferences();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Acessibilidade e Idioma"
        description="Preferências visuais, atalhos de teclado e idioma da interface."
      />
      <AcessibilidadeClient initial={prefs} />
    </div>
  );
}
