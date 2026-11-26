import Link from "next/link";
import { notFound } from "next/navigation";
import { Edit } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { hasPermission } from "@/lib/permissions";
import { requirePermission } from "@/lib/session";
import { WEEKDAYS } from "@/lib/validations";
import { getCellById } from "@/server/queries/cells";
import { searchMembersForSelect } from "@/server/queries/members";
import { CellDetailClient } from "./cell-detail-client";

export default async function CelulaFichaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requirePermission("celulas", "ver");
  const { id } = await params;

  const [data, candidates] = await Promise.all([
    getCellById(id),
    searchMembersForSelect(""),
  ]);

  if (!data) notFound();

  const { cell, activeMembers, meetings } = data;
  const canEdit = hasPermission(session, "celulas", "editar");

  return (
    <div className="space-y-6">
      <PageHeader
        title={cell.name}
        description={`${WEEKDAYS[cell.weekday] ?? cell.weekday} às ${cell.meetingTime} · ${cell.addressDistrict ?? "Sem bairro"}`}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge
              label={cell.isActive ? "Ativa" : "Inativa"}
              variant={cell.isActive ? "success" : "neutral"}
            />
            {canEdit ? (
              <Link
                href={`/celulas/${id}/editar`}
                className="inline-flex h-8 items-center gap-1.5 rounded-[2px] bg-blue-600 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-0 hover:bg-blue-700"
              >
                <Edit className="h-3.5 w-3.5" />
                Editar
              </Link>
            ) : null}
          </div>
        }
      />

      <CellDetailClient
        cellId={cell.id}
        activeMembers={activeMembers}
        meetings={meetings}
        candidates={candidates}
        canEdit={canEdit}
      />
    </div>
  );
}
