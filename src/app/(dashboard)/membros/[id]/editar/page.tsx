import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { MemberForm } from "@/components/members/member-form";
import { requirePermission } from "@/lib/session";
import { getMemberById } from "@/server/queries/members";

export default async function EditarMembroPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission("membros", "editar");
  const { id } = await params;
  const data = await getMemberById(id);

  if (!data) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Editar: ${data.member.fullName}`}
        actions={
          <Link
            href={`/membros/${id}`}
            className="inline-flex h-8 items-center rounded-[2px] border border-neutral-200 bg-neutral-0 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-700 hover:bg-neutral-50"
          >
            Voltar
          </Link>
        }
      />

      <MemberForm initial={data.member} />
    </div>
  );
}
