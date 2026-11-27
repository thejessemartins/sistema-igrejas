import { PageHeader } from "@/components/shared/page-header";
import { requireSession } from "@/lib/session";
import { getSurveysList } from "@/server/queries/surveys";
import { PesquisasClient } from "./pesquisas-client";

export default async function PesquisasPage() {
  const session = await requireSession();
  const list = await getSurveysList();
  const canManage = ["admin", "pastor", "secretario"].includes(
    session.user.role
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pesquisas e Formulários"
        description="Enquetes e formulários internos para membros e liderança."
      />
      <PesquisasClient surveys={list} canManage={canManage} />
    </div>
  );
}
