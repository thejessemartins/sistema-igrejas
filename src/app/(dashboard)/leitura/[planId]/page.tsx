import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { SeraCard } from "@/components/shared/sera-card";
import { requireSession } from "@/lib/session";
import { getReadingPlanById } from "@/server/queries/reading";
import { ReadingDaysClient } from "./reading-days-client";

export default async function PlanoLeituraPage({
  params,
}: {
  params: Promise<{ planId: string }>;
}) {
  const session = await requireSession();
  const { planId } = await params;
  const data = await getReadingPlanById(planId, session);
  if (!data) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title={data.plan.title}
        description={data.plan.description ?? ""}
        actions={
          <Link
            href="/leitura"
            className="inline-flex h-8 items-center rounded-[2px] border border-neutral-200 bg-neutral-0 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-700"
          >
            Voltar
          </Link>
        }
      />

      <SeraCard title={`Dias do Plano (${data.days.length})`}>
        <ReadingDaysClient
          planId={data.plan.id}
          days={data.days}
          completedDays={data.completedDays}
        />
      </SeraCard>
    </div>
  );
}
