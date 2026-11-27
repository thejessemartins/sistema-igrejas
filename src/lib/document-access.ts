export const DOCUMENT_CATEGORIES = [
  "ata",
  "estatuto",
  "regimento",
  "financeiro",
  "juridico",
  "outro",
] as const;

export type DocumentCategory = (typeof DOCUMENT_CATEGORIES)[number];

export const DOCUMENT_VISIBILITIES = [
  "todos_logados",
  "lideranca",
  "pastoral_financeiro",
  "admin",
] as const;

export type DocumentVisibility = (typeof DOCUMENT_VISIBILITIES)[number];

export const VISIBILITY_LABELS: Record<DocumentVisibility, string> = {
  todos_logados: "Todos os logados",
  lideranca: "Liderança",
  pastoral_financeiro: "Pastoral e Financeiro",
  admin: "Apenas Admin",
};

export function canViewDocument(
  role: string | null | undefined,
  visibility: string
): boolean {
  const r = role ?? "voluntario";
  if (r === "admin") return true;
  if (visibility === "todos_logados") return true;
  if (visibility === "lideranca") {
    return ["pastor", "secretario", "tesoureiro", "lider_celula"].includes(r);
  }
  if (visibility === "pastoral_financeiro") {
    return ["pastor", "tesoureiro"].includes(r);
  }
  return false;
}

export function canManageDocuments(role: string | null | undefined): boolean {
  return ["admin", "pastor", "secretario", "tesoureiro"].includes(role ?? "");
}
