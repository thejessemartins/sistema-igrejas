import { PageHeader } from "@/components/shared/page-header";
import { hasPermission } from "@/lib/permissions";
import { requirePermission } from "@/lib/session";
import { getRolePermissionOverrides } from "@/server/actions/permissions";
import { listUsers } from "@/server/queries/users";
import { RolePermissionsPanel } from "./role-permissions-panel";
import { UsersClient } from "./users-client";

export default async function UsuariosPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; role?: string; status?: string }>;
}) {
  const session = await requirePermission("usuarios", "ver");
  const params = await searchParams;

  const [users, overrides] = await Promise.all([
    listUsers({
      search: params.search,
      role: params.role,
      status:
        params.status === "active" || params.status === "inactive"
          ? params.status
          : "all",
    }),
    getRolePermissionOverrides(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Usuários"
        description="Gerencie usuários, papéis de acesso e status."
      />

      <UsersClient
        users={users}
        currentUserId={session.user.id}
        canCreate={hasPermission(session, "usuarios", "criar")}
        canEdit={hasPermission(session, "usuarios", "editar")}
      />

      <RolePermissionsPanel
        isAdmin={session.user.role === "admin"}
        overrides={overrides}
      />
    </div>
  );
}
