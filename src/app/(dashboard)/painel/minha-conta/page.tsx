import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { ROLE_LABELS } from "@/lib/permissions";
import { requireSession } from "@/lib/session";
import { AccountForms } from "./account-forms";

export default async function MinhaContaPage() {
  const session = await requireSession();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Minha Conta"
        description="Gerencie seus dados pessoais e senha de acesso."
        actions={
          <StatusBadge label={ROLE_LABELS[session.user.role]} variant="info" />
        }
      />

      <AccountForms
        initialName={session.user.name}
        email={session.user.email}
      />
    </div>
  );
}
