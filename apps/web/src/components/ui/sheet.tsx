"use client";

import { cloneElement, createContext, isValidElement, useContext } from "react";
import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  MouseEvent as ReactMouseEvent,
  ReactElement,
  ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@web/lib/utils";

type SheetProps = {
  open: boolean;
  onOpenChange: (_open: boolean) => void;
  children: ReactNode;
};

const SheetContext = createContext<SheetProps | null>(null);

export function Sheet({ open, onOpenChange, children }: SheetProps) {
  return <SheetContext.Provider value={{ open, onOpenChange, children }}>{children}</SheetContext.Provider>;
}

type SheetTriggerProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> & {
  asChild?: boolean;
  onClick?: (event: ReactMouseEvent<HTMLElement>) => void;
};

export function SheetTrigger({ children, asChild, ...props }: SheetTriggerProps) {
  const ctx = useContext(SheetContext);
  if (!ctx) return null;
  const onClick = (event: ReactMouseEvent<HTMLElement>) => {
    props.onClick?.(event);
    ctx.onOpenChange(true);
  };
  if (asChild && isValidElement(children)) {
    return cloneElement(
      children as ReactElement<{ onClick?: (event: ReactMouseEvent<HTMLElement>) => void }>,
      { onClick }
    );
  }
  return (
    <button type="button" onClick={onClick} {...props}>
      {children}
    </button>
  );
}

export function SheetContent({
  children,
  className,
  side = "right",
}: HTMLAttributes<HTMLDivElement> & { side?: "left" | "right" }) {
  const ctx = useContext(SheetContext);
  if (!ctx) return null;
  if (!ctx.open) return null;

  const panel = (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/50" onClick={() => ctx.onOpenChange(false)} />
      <div
        className={cn(
          "relative flex w-[320px] max-w-[80vw] flex-col border-l bg-background shadow-xl",
          side === "left" ? "order-first border-r" : "order-last border-l",
          className
        )}
      >
        {children}
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(panel, document.body);
}

export function SheetHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col space-y-1.5 p-4", className)} {...props} />;
}

export function SheetTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />;
}

export function SheetDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-muted-foreground", className)} {...props} />;
}

export function SheetFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mt-auto space-y-2 p-4", className)} {...props} />;
}
