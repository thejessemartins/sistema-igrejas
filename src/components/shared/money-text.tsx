import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

interface MoneyTextProps {
  cents: number;
  className?: string;
}

export function MoneyText({ cents, className }: MoneyTextProps) {
  return (
    <span className={cn("font-mono tabular-nums", className)}>
      {formatCurrency(cents)}
    </span>
  );
}
