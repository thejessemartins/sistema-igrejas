import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { CellForm } from "@/components/cells/cell-form";
import { requirePermission } from "@/lib/session";
import { getCellById } from "@/server/queries/cells";
import { searchMembersForSelect } from "@/server/queries/members";

export default async function EditarCelulaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission("celulas", "editar");
  const { id } = await params;

  const [data, membersList] = await Promise.all([
    getCellById(id),
    searchMembersForSelect(""),
  ]);

  if (!data) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Editar: ${data.cell.name}`}
        actions={
          <Link
            href={`/celulas/${id}`}
            className="inline-flex h-8 items-center rounded-[2px] border border-neutral-200 bg-neutral-0 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-700 hover:bg-neutral-50"
          >
            Voltar
          </Link>
        }
      />

      <CellForm initial={data.cell} membersList={membersList} />
    </div>
  );
}
