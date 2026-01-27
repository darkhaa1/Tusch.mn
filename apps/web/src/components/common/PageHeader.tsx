import type { ReactNode } from "react";
import { cn } from "@web/lib/utils";

type PageHeaderProps = {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
  size?: "md" | "lg";
};

/**
 * Reusable page section header (title + description + optional actions).
 * Use inside AppShell or standalone sections for consistent spacing.
 */
export function PageHeader({
  title,
  description,
  actions,
  className,
  size = "md",
}: PageHeaderProps) {
  if (!title && !description && !actions) return null;

  const titleClassName =
    size === "lg"
      ? "text-3xl font-semibold tracking-tight text-foreground"
      : "text-2xl font-semibold leading-tight tracking-tight";

  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-b border-border/80 pb-4 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <div className="space-y-1">
        {title ? <h1 className={titleClassName}>{title}</h1> : null}
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-col gap-2 sm:flex-row sm:items-center">{actions}</div> : null}
    </div>
  );
}

export default PageHeader;
