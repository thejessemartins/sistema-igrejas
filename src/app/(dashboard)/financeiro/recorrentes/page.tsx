import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { hasPermission } from "@/lib/permissions";
import { requirePermission } from "@/lib/session";
import { getFinancialCategories } from "@/server/queries/finance";
import { searchMembersForSelect } from "@/server/queries/members";
import { getRecurringDashboardData } from "@/server/queries/recurring";
import { RecorrentesClient } from "./recorrentes-client";

export default async function RecorrentesPage() {
  const session = await requirePermission("financeiro", "ver");

  const [data, categories, membersList] = await Promise.all([
    getRecurringDashboardData(),
    getFinancialCategories(),
    searchMembersForSelect(""),
  ]);

  const incomeCategories = categories.filter(
    (c) => c.kind === "receita" && c.isActive
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contribuições Recorrentes"
        description="Controle interno de compromissos declarados pelos membros. A confirmação é sempre manual no Financeiro."
        actions={
          <Link
            href="/financeiro"
            className="inline-flex h-8 items-center rounded-[2px] border border-neutral-200 bg-neutral-0 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-700 hover:bg-neutral-50"
          >
            Voltar
          </Link>
        }
      />

      <RecorrentesClient
        commitments={data.commitments}
        monthOccurrences={data.monthOccurrences}
        expectedMonthCents={data.expectedMonthCents}
        confirmedMonthCents={data.confirmedMonthCents}
        categories={incomeCategories}
        membersList={membersList}
        canManage={hasPermission(session, "financeiro", "criar")}
      />
    </div>
  );
}
