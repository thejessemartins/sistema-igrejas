import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { requireSession } from "@/lib/session";
import { getSurveyResults } from "@/server/queries/surveys";

export default async function ResultadosPesquisaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSession();
  const { id } = await params;
  const data = await getSurveyResults(id);
  if (!data) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Resultados: ${data.survey.title}`}
        description={`Total de respostas: ${data.totalResponses}`}
        actions={
          <Link
            href="/pesquisas"
            className="inline-flex h-8 items-center rounded-[2px] border border-neutral-200 bg-neutral-0 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-700"
          >
            Voltar
          </Link>
        }
      />

      <div className="space-y-4">
        {data.questions.map((q) => {
          const qAnswers = data.answers.filter((a) => a.questionId === q.id);
          const counts = new Map<string, number>();
          for (const a of qAnswers) {
            if (a.valuesJson) {
              for (const v of a.valuesJson) {
                counts.set(v, (counts.get(v) ?? 0) + 1);
              }
            } else if (a.valueText) {
              counts.set(a.valueText, (counts.get(a.valueText) ?? 0) + 1);
            }
          }

          return (
            <div
              key={q.id}
              className="rounded-[2px] border border-neutral-200 bg-neutral-0 p-4 space-y-2"
            >
              <p className="font-semibold text-neutral-900">{q.questionText}</p>
              <p className="text-xs text-neutral-500">
                {qAnswers.length} resposta(s)
              </p>
              <div className="space-y-1 text-sm">
                {Array.from(counts.entries()).map(([val, count]) => (
                  <div key={val} className="flex justify-between">
                    <span>{val}</span>
                    <span className="font-mono text-xs font-semibold">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
