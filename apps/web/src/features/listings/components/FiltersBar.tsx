import type { ReactNode } from "react";
import { cn } from "@web/lib/utils";

type FiltersBarProps = {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  filters?: ReactNode;
  className?: string;
  children: ReactNode;
};

export function FiltersBar({
  title,
  description,
  actions,
  filters,
  className,
  children,
}: FiltersBarProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {title || description || actions ? (
        <div className="flex items-center justify-between text-sm font-medium text-muted-foreground">
          <div className="flex flex-col gap-1">
            {title ? <span>{title}</span> : null}
            {description ? <span className="text-xs text-muted-foreground">{description}</span> : null}
          </div>
          {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
        </div>
      ) : null}
      {filters ? <div className="flex flex-wrap items-center gap-2">{filters}</div> : null}
      {children}
    </div>
  );
}

export default FiltersBar;
