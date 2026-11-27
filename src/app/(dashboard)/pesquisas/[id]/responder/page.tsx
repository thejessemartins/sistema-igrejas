import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { requireSession } from "@/lib/session";
import { getSurveyDetail } from "@/server/queries/surveys";
import { ResponderClient } from "./responder-client";

export default async function ResponderPesquisaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSession();
  const { id } = await params;
  const data = await getSurveyDetail(id);
  if (!data) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title={data.survey.title}
        description={data.survey.description ?? "Responda às perguntas abaixo."}
        actions={
          <Link
            href="/pesquisas"
            className="inline-flex h-8 items-center rounded-[2px] border border-neutral-200 bg-neutral-0 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-700"
          >
            Voltar
          </Link>
        }
      />
      <ResponderClient surveyId={data.survey.id} questions={data.questions} />
    </div>
  );
}
