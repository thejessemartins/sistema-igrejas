import { PageHeader } from "@/components/shared/page-header";
import { requireSession } from "@/lib/session";
import {
  getActiveUsersForChat,
  getUserThreads,
} from "@/server/queries/messages";
import { MensagensClient } from "./mensagens-client";

export default async function MensagensPage() {
  const session = await requireSession();
  const [threads, users] = await Promise.all([
    getUserThreads(session.user.id),
    getActiveUsersForChat(session.user.id),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mensagens Internas"
        description="Conversas diretas e em grupo entre usuários do sistema."
      />
      <MensagensClient threads={threads} users={users} />
    </div>
  );
}
