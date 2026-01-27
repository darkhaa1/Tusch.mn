import type { ReactNode } from "react";
import PageHeader from "../ui/PageHeader";

type AppShellProps = {
  title?: ReactNode;
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
          <PageHeader
            title={title}
            description={description}
            actions={actions}
            size="lg"
            className="mb-6"
          />
        ) : null}

        <div className="space-y-6">{children}</div>
      </div>
    </div>
  );
}

export default AppShell;
