import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { requireSession } from "@/lib/session";
import { getThreadMessages } from "@/server/queries/messages";
import { ThreadClient } from "./thread-client";

export default async function MensagemDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();
  const { id } = await params;
  const data = await getThreadMessages(id, session.user.id);
  if (!data) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title={data.thread.subject}
        description={`Conversa (${data.thread.kind})`}
        actions={
          <Link
            href="/mensagens"
            className="inline-flex h-8 items-center rounded-[2px] border border-neutral-200 bg-neutral-0 px-3 text-[11px] font-bold uppercase text-neutral-700"
          >
            Voltar
          </Link>
        }
      />
      <ThreadClient
        threadId={data.thread.id}
        currentUserId={session.user.id}
        messages={data.messages}
      />
    </div>
  );
}
