"use client";

import {
  cloneElement,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  MouseEvent as ReactMouseEvent,
  ReactElement,
  ReactNode,
} from "react";
import { cn } from "@web/lib/utils";

type DropdownContextValue = {
  open: boolean;
  toggle: () => void;
  close: () => void;
};

const DropdownContext = createContext<DropdownContextValue | null>(null);

type DropdownMenuProps = {
  children: ReactNode;
  defaultOpen?: boolean;
};

export function DropdownMenu({ children, defaultOpen }: DropdownMenuProps) {
  const [open, setOpen] = useState(Boolean(defaultOpen));
  const rootRef = useRef<HTMLDivElement>(null);

  const toggle = useCallback(() => setOpen((prev) => !prev), []);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (!target || !rootRef.current) return;
      if (!rootRef.current.contains(target)) {
        close();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, close]);

  return (
    <DropdownContext.Provider value={{ open, toggle, close }}>
      <div ref={rootRef} className="relative inline-block text-left">
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

type DropdownMenuTriggerProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> & {
  asChild?: boolean;
  onClick?: (event: ReactMouseEvent<HTMLElement>) => void;
};

export function DropdownMenuTrigger({ asChild, children, ...props }: DropdownMenuTriggerProps) {
  const ctx = useContext(DropdownContext);
  if (!ctx) {
    return (
      <button type="button" {...props}>
        {children}
      </button>
    );
  }

  const handleClick = (event: ReactMouseEvent<HTMLElement>) => {
    ctx.toggle();
    props.onClick?.(event);
  };

  if (asChild && isValidElement(children)) {
    return cloneElement(
      children as ReactElement<{ onClick?: (event: ReactMouseEvent<HTMLElement>) => void }>,
      { onClick: handleClick }
    );
  }

  return (
    <button type="button" onClick={handleClick} {...props}>
      {children}
    </button>
  );
}

type DropdownMenuContentProps = HTMLAttributes<HTMLDivElement>;

export function DropdownMenuContent({ className, children, ...props }: DropdownMenuContentProps) {
  const ctx = useContext(DropdownContext);
  if (!ctx?.open) return null;
  return (
    <div
      className={cn(
        "absolute right-0 z-50 mt-2 min-w-45 rounded-md border border-border bg-background p-1 shadow-lg",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

type ItemProps = ButtonHTMLAttributes<HTMLButtonElement>;
export function DropdownMenuItem({ className, children, ...props }: ItemProps) {
  const ctx = useContext(DropdownContext);
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
        ctx?.close();
        props.onClick?.(event);
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

export function DropdownMenuLabel({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("px-3 py-2 text-xs font-semibold uppercase text-muted-foreground", className)} {...props} />
  );
}

export { DropdownContext };
