import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DataTableShellProps {
  toolbar?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function DataTableShell({
  toolbar,
  children,
  footer,
  className,
}: DataTableShellProps) {
  return (
    <div
      className={cn(
        "rounded-[2px] border border-neutral-200 bg-neutral-0",
        className
      )}
    >
      {toolbar ? (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200 px-4 py-3">
          {toolbar}
        </div>
      ) : null}
      <div className="overflow-x-auto">{children}</div>
      {footer ? (
        <div className="border-t border-neutral-200 bg-neutral-25 px-4 py-2.5 text-xs text-neutral-500">
          {footer}
        </div>
      ) : null}
    </div>
  );
}
