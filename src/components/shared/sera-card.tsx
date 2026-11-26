import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SeraCardProps {
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function SeraCard({
  title,
  description,
  children,
  footer,
  className,
}: SeraCardProps) {
  return (
    <section
      className={cn(
        "rounded-[2px] border border-neutral-200 bg-neutral-0",
        className
      )}
    >
      {title || description ? (
        <header className="border-b border-neutral-200 px-4 py-3">
          {title ? (
            <h2 className="font-heading text-xs font-semibold uppercase tracking-wider text-neutral-800">
              {title}
            </h2>
          ) : null}
          {description ? (
            <p className="mt-1 text-xs text-neutral-500">{description}</p>
          ) : null}
        </header>
      ) : null}
      <div className="p-4">{children}</div>
      {footer ? (
        <footer className="border-t border-neutral-200 bg-neutral-25 px-4 py-2.5 text-xs text-neutral-500">
          {footer}
        </footer>
      ) : null}
    </section>
  );
}
