import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-[2px] border border-dashed border-neutral-300 bg-neutral-25 px-6 py-10 text-center",
        className
      )}
    >
      {Icon ? (
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-[2px] border border-neutral-200 bg-neutral-0 text-neutral-500">
          <Icon className="h-5 w-5" />
        </div>
      ) : null}
      <h3 className="font-heading text-sm font-semibold text-neutral-900">
        {title}
      </h3>
      {description ? (
        <p className="mt-1 max-w-sm text-xs text-neutral-500">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
