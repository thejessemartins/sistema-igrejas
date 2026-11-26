import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { requirePermission } from "@/lib/session";
import { getCells } from "@/server/queries/cells";
import { getMinistries } from "@/server/queries/ministries";
import { NoticeForm } from "./notice-form";

export default async function NovoAvisoPage() {
  await requirePermission("avisos", "criar");
  const [cellsList, ministriesList] = await Promise.all([
    getCells(),
    getMinistries(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Novo Aviso"
        actions={
          <Link
            href="/avisos"
            className="inline-flex h-8 items-center rounded-[2px] border border-neutral-200 bg-neutral-0 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-700 hover:bg-neutral-50"
          >
            Voltar
          </Link>
        }
      />

      <NoticeForm
        cellsList={cellsList.map((c) => ({ id: c.id, name: c.name }))}
        ministriesList={ministriesList.map((m) => ({ id: m.id, name: m.name }))}
      />
    </div>
  );
}
