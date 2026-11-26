import Link from "next/link";
import { Cake } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTableShell } from "@/components/shared/data-table-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { requirePermission } from "@/lib/session";
import { getBirthdays } from "@/server/queries/members";

const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export default async function AniversariantesPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  await requirePermission("membros", "ver");
  const params = await searchParams;
  const currentMonth = new Date().getMonth() + 1;
  const month = Math.min(12, Math.max(1, Number(params.month) || currentMonth));

  const items = await getBirthdays(month);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Aniversariantes"
        description={`Membros que fazem aniversário em ${MONTHS[month - 1]}.`}
      />

      <DataTableShell
        toolbar={
          <form method="GET" className="flex items-center gap-2">
            <select
              name="month"
              defaultValue={String(month)}
              className="h-8 rounded-[2px] border border-neutral-200 bg-neutral-0 px-2 text-xs"
            >
              {MONTHS.map((m, idx) => (
                <option key={m} value={idx + 1}>
                  {m}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="inline-flex h-8 items-center rounded-[2px] border border-neutral-200 bg-neutral-0 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-700 hover:bg-neutral-50"
            >
              Filtrar mês
            </button>
          </form>
        }
      >
        {items.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon={Cake}
              title="Nenhum aniversariante neste mês"
              description="Selecione outro mês no filtro acima."
            />
          </div>
        ) : (
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-25 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                <th className="px-4 py-2.5">Dia</th>
                <th className="px-4 py-2.5">Nome</th>
                <th className="px-4 py-2.5">Idade</th>
                <th className="px-4 py-2.5">Telefone</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-neutral-25">
                  <td className="px-4 py-2.5 font-mono text-xs font-semibold text-neutral-900">
                    {item.day ? String(item.day).padStart(2, "0") : "—"}
                  </td>
                  <td className="px-4 py-2.5">
                    <Link
                      href={`/membros/${item.id}`}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      {item.fullName}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 text-neutral-600">
                    {item.age !== null ? `${item.age} anos` : "—"}
                  </td>
                  <td className="px-4 py-2.5 text-neutral-600">
                    {item.phone ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </DataTableShell>
    </div>
  );
}
