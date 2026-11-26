import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

export function formatDate(date: Date | string, pattern = "dd/MM/yyyy"): string {
  const parsed = typeof date === "string" ? new Date(date) : date;
  return format(parsed, pattern, { locale: ptBR });
}
