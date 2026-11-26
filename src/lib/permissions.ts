export const ROLES = [
  "admin",
  "pastor",
  "secretario",
  "tesoureiro",
  "lider_celula",
  "voluntario",
] as const;

export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  admin: "Administrador",
  pastor: "Pastor",
  secretario: "Secretário",
  tesoureiro: "Tesoureiro",
  lider_celula: "Líder de Célula",
  voluntario: "Voluntário",
};

export type ModuleName =
  | "dashboard"
  | "membros"
  | "visitantes"
  | "celulas"
  | "cultos"
  | "presenca"
  | "ministerios"
  | "escalas"
  | "avisos"
  | "financeiro"
  | "relatorios"
  | "usuarios"
  | "auditoria"
  | "permissoes"
  | "minha_conta";

export type ActionName = "ver" | "criar" | "editar" | "excluir" | "exportar";

type PermissionMatrix = Record<Role, Partial<Record<ModuleName, ActionName[]>>>;

const ALL_ACTIONS: ActionName[] = ["ver", "criar", "editar", "excluir", "exportar"];

const MATRIX: PermissionMatrix = {
  admin: {
    dashboard: ALL_ACTIONS,
    membros: ALL_ACTIONS,
    visitantes: ALL_ACTIONS,
    celulas: ALL_ACTIONS,
    cultos: ALL_ACTIONS,
    presenca: ALL_ACTIONS,
    ministerios: ALL_ACTIONS,
    escalas: ALL_ACTIONS,
    avisos: ALL_ACTIONS,
    financeiro: ALL_ACTIONS,
    relatorios: ALL_ACTIONS,
    usuarios: ALL_ACTIONS,
    auditoria: ["ver", "exportar"],
    permissoes: ALL_ACTIONS,
    minha_conta: ["ver", "editar"],
  },
  pastor: {
    dashboard: ["ver", "exportar"],
    membros: ALL_ACTIONS,
    visitantes: ALL_ACTIONS,
    celulas: ALL_ACTIONS,
    cultos: ALL_ACTIONS,
    presenca: ALL_ACTIONS,
    ministerios: ALL_ACTIONS,
    escalas: ALL_ACTIONS,
    avisos: ALL_ACTIONS,
    financeiro: ALL_ACTIONS,
    relatorios: ALL_ACTIONS,
    usuarios: ["ver", "criar", "editar"],
    minha_conta: ["ver", "editar"],
  },
  secretario: {
    dashboard: ["ver"],
    membros: ALL_ACTIONS,
    visitantes: ALL_ACTIONS,
    celulas: ALL_ACTIONS,
    cultos: ALL_ACTIONS,
    presenca: ALL_ACTIONS,
    ministerios: ALL_ACTIONS,
    escalas: ALL_ACTIONS,
    avisos: ALL_ACTIONS,
    relatorios: ["ver", "exportar"],
    minha_conta: ["ver", "editar"],
  },
  tesoureiro: {
    dashboard: ["ver"],
    membros: ["ver"],
    financeiro: ALL_ACTIONS,
    relatorios: ["ver", "exportar"],
    minha_conta: ["ver", "editar"],
  },
  lider_celula: {
    dashboard: ["ver"],
    celulas: ["ver", "editar"],
    membros: ["ver"],
    presenca: ["ver", "criar", "editar"],
    avisos: ["ver", "criar", "editar"],
    minha_conta: ["ver", "editar"],
  },
  voluntario: {
    dashboard: ["ver"],
    escalas: ["ver"],
    cultos: ["ver"],
    avisos: ["ver"],
    minha_conta: ["ver", "editar"],
  },
};

export interface SessionLike {
  user?: {
    id: string;
    role?: string | null;
    active?: boolean | null;
  } | null;
}

export function hasPermission(
  session: SessionLike | null | undefined,
  modulo: ModuleName,
  acao: ActionName
): boolean {
  if (!session?.user) return false;
  if (session.user.active === false) return false;
  const role = session.user.role as Role | undefined;
  if (!role || !(role in MATRIX)) return false;

  const allowed = MATRIX[role][modulo];
  if (!allowed) return false;
  return allowed.includes(acao);
}
