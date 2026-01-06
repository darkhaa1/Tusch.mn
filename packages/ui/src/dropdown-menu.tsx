"use client";

import * as React from "react";
import { cn } from "../../lib/utils";

type DropdownContextValue = {
  open: boolean;
  toggle: () => void;
  close: () => void;
};

const DropdownContext = React.createContext<DropdownContextValue | null>(null);

type DropdownMenuProps = {
  children: React.ReactNode;
  defaultOpen?: boolean;
};

export function DropdownMenu({ children, defaultOpen }: DropdownMenuProps) {
  const [open, setOpen] = React.useState(Boolean(defaultOpen));

  const toggle = React.useCallback(() => setOpen((prev) => !prev), []);
  const close = React.useCallback(() => setOpen(false), []);

  return (
    <DropdownContext.Provider value={{ open, toggle, close }}>
      <div className="relative inline-block text-left">{children}</div>
    </DropdownContext.Provider>
  );
}

type DropdownMenuTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
};

export function DropdownMenuTrigger({ asChild, children, ...props }: DropdownMenuTriggerProps) {
  const ctx = React.useContext(DropdownContext);
  if (!ctx) {
    return (
      <button type="button" {...props}>
        {children}
      </button>
    );
  }

  const handleClick = (...args: any[]) => {
    ctx.toggle();
    // @ts-ignore
    props.onClick?.(...args);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as any, { onClick: handleClick });
  }

  return (
    <button type="button" onClick={handleClick} {...props}>
      {children}
    </button>
  );
}

type DropdownMenuContentProps = React.HTMLAttributes<HTMLDivElement>;

export function DropdownMenuContent({ className, children, ...props }: DropdownMenuContentProps) {
  const ctx = React.useContext(DropdownContext);
  if (!ctx?.open) return null;
  return (
    <div
      className={cn(
        "absolute right-0 z-50 mt-2 min-w-[180px] rounded-md border border-border bg-background p-1 shadow-lg",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

type ItemProps = React.ButtonHTMLAttributes<HTMLButtonElement>;
export function DropdownMenuItem({ className, children, ...props }: ItemProps) {
  const ctx = React.useContext(DropdownContext);
  return (
    <button
      type="button"
      className={cn(
        "flex w-full cursor-pointer select-none items-center rounded-sm px-3 py-2 text-sm text-foreground",
        "hover:bg-muted/60 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      onClick={(event) => {
        props.onClick?.(event);
        ctx?.close();
      }}
      {...props}
    >
      {children}
    </button>
  );
}

export function DropdownMenuSeparator() {
  return <div className="my-1 h-px w-full bg-border" role="separator" />;
}

export function DropdownMenuLabel({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("px-3 py-2 text-xs font-semibold uppercase text-muted-foreground", className)} {...props} />
  );
}

export { DropdownContext };
