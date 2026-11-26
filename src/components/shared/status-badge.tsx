import { cn } from "@/lib/utils";

type StatusVariant = "neutral" | "info" | "success" | "warning" | "danger";

interface StatusBadgeProps {
  label: string;
  variant?: StatusVariant;
  className?: string;
}

const variantClasses: Record<StatusVariant, string> = {
  neutral: "border-neutral-200 bg-neutral-100 text-neutral-800",
  info: "border-blue-200 bg-blue-50 text-blue-700",
  success: "border-green-600/30 bg-green-600/10 text-green-600",
  warning: "border-amber-600/30 bg-amber-600/10 text-amber-600",
  danger: "border-red-600/30 bg-red-600/10 text-red-600",
};

export function StatusBadge({
  label,
  variant = "neutral",
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[2px] border px-2 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className
      )}
    >
      {label}
    </span>
  );
}
