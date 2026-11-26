import { PageHeader } from "@/components/shared/page-header";
import { hasPermission } from "@/lib/permissions";
import { requirePermission } from "@/lib/session";
import { searchMembersForSelect } from "@/server/queries/members";
import { getMinistries } from "@/server/queries/ministries";
import { MinistriesClient } from "./ministries-client";

export default async function MinisteriosPage() {
  const session = await requirePermission("ministerios", "ver");
  const [items, membersList] = await Promise.all([
    getMinistries(),
    searchMembersForSelect(""),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ministérios"
        description="Equipes de serviço e voluntários da igreja."
      />

      <MinistriesClient
        items={items}
        membersList={membersList}
        canCreate={hasPermission(session, "ministerios", "criar")}
      />
    </div>
  );
}
