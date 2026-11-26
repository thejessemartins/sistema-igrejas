import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { requirePermission } from "@/lib/session";
import { searchMembersForSelect } from "@/server/queries/members";
import { VisitorQuickForm } from "./visitor-quick-form";

export default async function NovoVisitantePage() {
  await requirePermission("visitantes", "criar");
  const membersList = await searchMembersForSelect("");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Novo Visitante"
        description="Cadastro rápido para recepção."
        actions={
          <Link
            href="/visitantes"
            className="inline-flex h-8 items-center rounded-[2px] border border-neutral-200 bg-neutral-0 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-700 hover:bg-neutral-50"
          >
            Voltar
          </Link>
        }
      />

      <VisitorQuickForm membersList={membersList} />
    </div>
  );
}
