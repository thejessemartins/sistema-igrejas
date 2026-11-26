import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { CellForm } from "@/components/cells/cell-form";
import { requirePermission } from "@/lib/session";
import { searchMembersForSelect } from "@/server/queries/members";

export default async function NovaCelulaPage() {
  await requirePermission("celulas", "criar");
  const membersList = await searchMembersForSelect("");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nova Célula"
        actions={
          <Link
            href="/celulas"
            className="inline-flex h-8 items-center rounded-[2px] border border-neutral-200 bg-neutral-0 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-700 hover:bg-neutral-50"
          >
            Voltar
          </Link>
        }
      />

      <CellForm membersList={membersList} />
    </div>
  );
}
