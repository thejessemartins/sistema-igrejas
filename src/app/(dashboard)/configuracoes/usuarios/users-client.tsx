"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, UserCheck, UserX } from "lucide-react";
import { SeraCard } from "@/components/shared/sera-card";
import { DataTableShell } from "@/components/shared/data-table-shell";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { ROLES, ROLE_LABELS, type Role } from "@/lib/permissions";
import { createUserAction, updateUserAction } from "@/server/actions/users";

export interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  createdAt: Date;
}

export function UsersClient({
  users,
  currentUserId,
  canCreate,
  canEdit,
}: {
  users: UserRow[];
  currentUserId: string;
  canCreate: boolean;
  canEdit: boolean;
}) {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("voluntario");
  const [password, setPassword] = useState("");
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    setLoading(true);
    const res = await createUserAction({
      name,
      email,
      role,
      password,
      active: true,
    });
    setLoading(false);

    if (!res.ok) {
      setFeedback({ type: "error", text: res.error });
      return;
    }

    setFeedback({ type: "success", text: res.message });
    setName("");
    setEmail("");
    setPassword("");
    setShowCreate(false);
    router.refresh();
  }

  async function handleToggleActive(u: UserRow) {
    setFeedback(null);
    const res = await updateUserAction({
      userId: u.id,
      name: u.name,
      role: u.role as Role,
      active: !u.active,
    });

    if (!res.ok) {
      setFeedback({ type: "error", text: res.error });
      return;
    }

    setFeedback({ type: "success", text: res.message });
    router.refresh();
  }

  async function handleRoleChange(u: UserRow, newRole: Role) {
    setFeedback(null);
    const res = await updateUserAction({
      userId: u.id,
      name: u.name,
      role: newRole,
      active: u.active,
    });

    if (!res.ok) {
      setFeedback({ type: "error", text: res.error });
      return;
    }

    setFeedback({ type: "success", text: res.message });
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {feedback ? (
        <div
          className={
            feedback.type === "error"
              ? "rounded-[2px] border border-red-600/30 bg-red-600/10 px-3 py-2 text-xs text-red-600"
              : "rounded-[2px] border border-green-600/30 bg-green-600/10 px-3 py-2 text-xs text-green-600"
          }
        >
          {feedback.text}
        </div>
      ) : null}

      {canCreate && showCreate ? (
        <SeraCard
          title="Novo Usuário"
          description="Defina nome, e-mail, papel e senha temporária local."
        >
          <form
            onSubmit={handleCreate}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600">
                Nome
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border-b border-neutral-300 bg-transparent py-1.5 text-sm focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600">
                E-mail
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-b border-neutral-300 bg-transparent py-1.5 text-sm focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600">
                Papel
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full border-b border-neutral-300 bg-transparent py-1.5 text-sm focus:border-blue-600 focus:outline-none"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600">
                Senha Temporária
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-b border-neutral-300 bg-transparent py-1.5 text-sm focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 sm:col-span-2 lg:col-span-4">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-8 items-center rounded-[2px] bg-blue-600 px-4 text-[11px] font-bold uppercase tracking-wider text-neutral-0 hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Criando..." : "Criar usuário"}
              </button>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="inline-flex h-8 items-center rounded-[2px] border border-neutral-200 bg-neutral-0 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-700 hover:bg-neutral-50"
              >
                Cancelar
              </button>
            </div>
          </form>
        </SeraCard>
      ) : null}

      <DataTableShell
        toolbar={
          <div className="flex w-full items-center justify-between gap-2">
            <span className="text-xs font-medium text-neutral-600">
              {users.length} usuário(s) encontrado(s)
            </span>
            {canCreate ? (
              <button
                type="button"
                onClick={() => setShowCreate((v) => !v)}
                className="inline-flex h-8 items-center gap-1.5 rounded-[2px] bg-blue-600 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-0 hover:bg-blue-700"
              >
                <Plus className="h-3.5 w-3.5" />
                Novo Usuário
              </button>
            ) : null}
          </div>
        }
      >
        {users.length === 0 ? (
          <div className="p-4">
            <EmptyState
              title="Nenhum usuário encontrado"
              description="Ajuste os filtros ou crie um novo usuário."
            />
          </div>
        ) : (
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-25 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                <th className="px-4 py-2.5">Nome</th>
                <th className="px-4 py-2.5">E-mail</th>
                <th className="px-4 py-2.5">Papel</th>
                <th className="px-4 py-2.5">Status</th>
                {canEdit ? <th className="px-4 py-2.5">Ações</th> : null}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-neutral-25">
                  <td className="px-4 py-2.5 font-medium text-neutral-900">
                    {u.name}
                  </td>
                  <td className="px-4 py-2.5 text-neutral-600">{u.email}</td>
                  <td className="px-4 py-2.5">
                    {canEdit ? (
                      <select
                        value={u.role}
                        onChange={(e) =>
                          handleRoleChange(u, e.target.value as Role)
                        }
                        className="rounded-[2px] border border-neutral-200 bg-neutral-0 px-2 py-1 text-xs"
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {ROLE_LABELS[r]}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span>{ROLE_LABELS[u.role as Role] ?? u.role}</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    <StatusBadge
                      label={u.active ? "Ativo" : "Inativo"}
                      variant={u.active ? "success" : "neutral"}
                    />
                  </td>
                  {canEdit ? (
                    <td className="px-4 py-2.5">
                      <button
                        type="button"
                        disabled={u.id === currentUserId}
                        onClick={() => handleToggleActive(u)}
                        className="inline-flex h-7 items-center gap-1 rounded-[2px] border border-neutral-200 bg-neutral-0 px-2.5 text-[11px] font-bold uppercase tracking-wider text-neutral-700 hover:bg-neutral-50 disabled:opacity-40"
                      >
                        {u.active ? (
                          <>
                            <UserX className="h-3.5 w-3.5" />
                            Inativar
                          </>
                        ) : (
                          <>
                            <UserCheck className="h-3.5 w-3.5" />
                            Ativar
                          </>
                        )}
                      </button>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </DataTableShell>
    </div>
  );
}
