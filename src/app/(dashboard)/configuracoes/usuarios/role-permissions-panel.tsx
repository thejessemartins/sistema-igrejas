"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  PERMISSION_MATRIX,
  ROLE_LABELS,
  ROLES,
  type ActionName,
  type ModuleName,
  type Role,
} from "@/lib/permissions";
import { toggleRolePermission } from "@/server/actions/permissions";

const MODULES: Array<{ key: ModuleName; label: string }> = [
  { key: "dashboard", label: "Painel" },
  { key: "membros", label: "Membros" },
  { key: "visitantes", label: "Visitantes" },
  { key: "celulas", label: "Células" },
  { key: "cultos", label: "Cultos e Eventos" },
  { key: "presenca", label: "Presença" },
  { key: "ministerios", label: "Ministérios" },
  { key: "escalas", label: "Escalas" },
  { key: "avisos", label: "Avisos" },
  { key: "financeiro", label: "Financeiro" },
  { key: "relatorios", label: "Relatórios" },
  { key: "usuarios", label: "Usuários" },
  { key: "auditoria", label: "Auditoria" },
  { key: "permissoes", label: "Permissões" },
  { key: "minha_conta", label: "Minha Conta" },
];

const ACTIONS: Array<{ key: ActionName; label: string }> = [
  { key: "ver", label: "Ver" },
  { key: "criar", label: "Criar" },
  { key: "editar", label: "Editar" },
  { key: "excluir", label: "Excluir" },
  { key: "exportar", label: "Exportar" },
];

export function RolePermissionsPanel({
  isAdmin,
  overrides,
}: {
  isAdmin: boolean;
  overrides: Record<string, boolean>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedRole, setSelectedRole] = useState<Role>("admin");
  const rolePerms = PERMISSION_MATRIX[selectedRole] ?? {};

  function isAllowed(mod: ModuleName, act: ActionName): boolean {
    const key = `${selectedRole}:${mod}:${act}`;
    if (key in overrides) return overrides[key];
    return (rolePerms[mod] ?? []).includes(act);
  }

  function handleToggle(mod: ModuleName, act: ActionName, next: boolean) {
    startTransition(async () => {
      await toggleRolePermission(selectedRole, mod, act, next);
      router.refresh();
    });
  }

  return (
    <div className="rounded-[2px] border border-neutral-200 bg-neutral-0 p-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-800">
            Permissões por Papel no Sistema
          </h2>
          <p className="text-xs text-neutral-500">
            {isAdmin
              ? "Filtre por papel e marque ou desmarque as permissões de acesso."
              : "Filtre por papel para visualizar o que cada perfil pode acessar."}
          </p>
        </div>

        <select
          aria-label="Filtrar permissões por papel"
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value as Role)}
          className="h-9 rounded-[2px] border border-neutral-300 bg-neutral-0 px-3 text-sm font-medium"
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {ROLE_LABELS[r]}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
            <tr>
              <th className="px-3 py-2">Módulo</th>
              {ACTIONS.map((a) => (
                <th key={a.key} className="px-3 py-2 text-center">
                  {a.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {MODULES.map((m) => (
              <tr key={m.key} className="hover:bg-neutral-50">
                <td className="px-3 py-2 font-medium text-neutral-800">
                  {m.label}
                </td>
                {ACTIONS.map((a) => {
                  const checked = isAllowed(m.key, a.key);
                  return (
                    <td key={a.key} className="px-3 py-2 text-center">
                      {isAdmin ? (
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={isPending}
                          aria-label={`${ROLE_LABELS[selectedRole]} - ${m.label} - ${a.label}`}
                          onChange={(e) =>
                            handleToggle(m.key, a.key, e.target.checked)
                          }
                          className="h-4 w-4 cursor-pointer accent-neutral-900"
                        />
                      ) : checked ? (
                        <span className="inline-block rounded-[2px] bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                          Sim
                        </span>
                      ) : (
                        <span className="text-xs text-neutral-300">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
