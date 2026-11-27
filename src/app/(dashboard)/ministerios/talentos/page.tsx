import { PageHeader } from "@/components/shared/page-header";
import { requireSession } from "@/lib/session";
import { getTalentsDashboard } from "@/server/queries/talents";
import { TalentosClient } from "./talentos-client";

export default async function TalentosPage({
  searchParams,
}: {
  searchParams: Promise<{ tagId?: string; weekday?: string; period?: string }>;
}) {
  await requireSession();
  const { tagId, weekday, period } = await searchParams;
  const wd = weekday !== undefined && weekday !== "" ? Number(weekday) : undefined;
  const data = await getTalentsDashboard(tagId || undefined, wd, period || undefined);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Banco de Talentos e Voluntários"
        description="Habilidades e disponibilidade dos membros para servir nos ministérios."
      />
      <TalentosClient
        tags={data.tags}
        membersList={data.membersList}
        results={data.results}
      />
    </div>
  );
}
