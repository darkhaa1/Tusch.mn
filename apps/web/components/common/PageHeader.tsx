import { cn } from "../../app/lib/utils";

type PageHeaderProps = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
};

/**
 * Reusable page section header (title + description + optional actions).
 * Use inside AppShell or standalone sections for consistent spacing.
 */
export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  if (!title && !description && !actions) return null;

  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-b border-border/80 pb-4 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <div className="space-y-1">
        {title ? <h1 className="text-2xl font-semibold leading-tight tracking-tight">{title}</h1> : null}
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-col gap-2 sm:flex-row sm:items-center">{actions}</div> : null}
    </div>
  );
}

export default PageHeader;
