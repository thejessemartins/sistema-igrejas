import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { MemberForm } from "@/components/members/member-form";
import { requirePermission } from "@/lib/session";

export default async function NovoMembroPage() {
  await requirePermission("membros", "criar");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Novo Membro"
        description="Cadastre um novo membro preenchendo os dados abaixo."
        actions={
          <Link
            href="/membros"
            className="inline-flex h-8 items-center rounded-[2px] border border-neutral-200 bg-neutral-0 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-700 hover:bg-neutral-50"
          >
            Voltar
          </Link>
        }
      />

      <MemberForm />
    </div>
  );
}
