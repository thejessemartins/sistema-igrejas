import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { hasPermission } from "@/lib/permissions";
import { requirePermission } from "@/lib/session";
import { searchMembersForSelect } from "@/server/queries/members";
import { getMinistryById } from "@/server/queries/ministries";
import { MinistryDetailClient } from "./ministry-detail-client";

export default async function MinisterioFichaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requirePermission("ministerios", "ver");
  const { id } = await params;

  const [data, candidates] = await Promise.all([
    getMinistryById(id),
    searchMembersForSelect(""),
  ]);

  if (!data) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title={data.ministry.name}
        description={data.ministry.description ?? "Equipe do ministério"}
        actions={
          <Link
            href="/ministerios"
            className="inline-flex h-8 items-center rounded-[2px] border border-neutral-200 bg-neutral-0 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-700 hover:bg-neutral-50"
          >
            Voltar
          </Link>
        }
      />

      <MinistryDetailClient
        ministryId={data.ministry.id}
        volunteers={data.volunteers}
        candidates={candidates}
        canEdit={hasPermission(session, "ministerios", "editar")}
      />
    </div>
  );
}
