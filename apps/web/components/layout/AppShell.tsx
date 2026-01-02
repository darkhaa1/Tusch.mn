import type { ReactNode } from "react";
import { cn } from "../../app/lib/utils";

type AppShellProps = {
  title?: string;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
};

export function AppShell({ title, description, actions, children }: AppShellProps) {
  const hasHeader = Boolean(title || description || actions);

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 sm:pb-0">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        {hasHeader ? (
          <header className="mb-6 flex flex-col gap-3 border-b border-border/80 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              {title ? (
                <h1 className="text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
              ) : null}
              {description ? (
                <div className="text-sm text-muted-foreground">{description}</div>
              ) : null}
            </div>
            {actions ? <div className={cn("flex flex-col gap-2 sm:flex-row sm:items-center")}>{actions}</div> : null}
          </header>
        ) : null}

        <div className="space-y-6">{children}</div>
      </div>
    </div>
  );
}

export default AppShell;
