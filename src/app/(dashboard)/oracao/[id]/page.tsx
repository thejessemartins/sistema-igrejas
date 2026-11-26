import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { SeraCard } from "@/components/shared/sera-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { requireSession } from "@/lib/session";
import { getPrayerRequestById } from "@/server/queries/prayer";
import { PrayerActionsClient } from "./prayer-actions-client";

export default async function OracaoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();
  const { id } = await params;
  const item = await getPrayerRequestById(id, session);
  if (!item) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title={item.title}
        description={`Por: ${item.authorDisplay} · Visibilidade: ${item.visibility}`}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge label={item.status} variant="info" />
            <Link
              href="/oracao"
              className="inline-flex h-8 items-center rounded-[2px] border border-neutral-200 bg-neutral-0 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-700"
            >
              Voltar
            </Link>
          </div>
        }
      />

      <SeraCard title="Pedido">
        <p className="whitespace-pre-line text-sm text-neutral-800">
          {item.body}
        </p>
      </SeraCard>

      <SeraCard title="Intercessão">
        <PrayerActionsClient
          id={item.id}
          canMarkAnswered={["admin", "pastor"].includes(session.user.role)}
          status={item.status}
        />
      </SeraCard>
    </div>
  );
}
