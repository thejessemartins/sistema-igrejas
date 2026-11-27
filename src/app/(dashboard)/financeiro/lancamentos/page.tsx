import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { hasPermission } from "@/lib/permissions";
import { requirePermission } from "@/lib/session";
import { searchMembersForSelect } from "@/server/queries/members";
import {
  getFinancialCategories,
  getTransactions,
} from "@/server/queries/finance";
import { getRecurringOccurrenceForPrefill } from "@/server/queries/recurring";
import { TransactionsClient } from "./transactions-client";

export default async function LancamentosPage({
  searchParams,
}: {
  searchParams: Promise<{ occurrenceId?: string }>;
}) {
  const session = await requirePermission("financeiro", "ver");
  const { occurrenceId } = await searchParams;

  const [items, categories, membersList, prefillOccurrence] = await Promise.all(
    [
      getTransactions(),
      getFinancialCategories(),
      searchMembersForSelect(""),
      occurrenceId ? getRecurringOccurrenceForPrefill(occurrenceId) : null,
    ]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lançamentos"
        description="Receitas e despesas manuais."
        actions={
          <Link
            href="/financeiro"
            className="inline-flex h-8 items-center rounded-[2px] border border-neutral-200 bg-neutral-0 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-700 hover:bg-neutral-50"
          >
            Voltar
          </Link>
        }
      />

      <TransactionsClient
        items={items}
        categories={categories}
        membersList={membersList}
        canCreate={hasPermission(session, "financeiro", "criar")}
        prefillOccurrence={prefillOccurrence}
      />
    </div>
  );
}
