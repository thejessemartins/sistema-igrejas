import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { SeraCard } from "@/components/shared/sera-card";
import { requireSession } from "@/lib/session";
import { getSermonById } from "@/server/queries/sermons";

export default async function SermaoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();
  const { id } = await params;
  const sermon = await getSermonById(id, session);
  if (!sermon) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title={sermon.title}
        description={`${sermon.preachedAt} · ${sermon.preacherText ?? "—"} · ${sermon.bibleReference ?? ""}`}
        actions={
          <Link
            href="/sermoes"
            className="inline-flex h-8 items-center rounded-[2px] border border-neutral-200 bg-neutral-0 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-700"
          >
            Voltar
          </Link>
        }
      />

      <SeraCard title="Resumo / Esboço">
        <p className="whitespace-pre-line text-sm text-neutral-800">
          {sermon.summary ?? "Sem resumo cadastrado."}
        </p>
      </SeraCard>
    </div>
  );
}
