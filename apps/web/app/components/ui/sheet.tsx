"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "../../lib/utils";

type SheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
};

const SheetContext = React.createContext<SheetProps | null>(null);

export function Sheet({ open, onOpenChange, children }: SheetProps) {
  return <SheetContext.Provider value={{ open, onOpenChange, children }}>{children}</SheetContext.Provider>;
}

export function SheetTrigger({
  children,
  asChild,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }) {
  const ctx = React.useContext(SheetContext);
  if (!ctx) return null;
  const onClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    props.onClick?.(event);
    ctx.onOpenChange(true);
  };
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as any, { onClick });
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
}: React.HTMLAttributes<HTMLDivElement> & { side?: "left" | "right" }) {
  const ctx = React.useContext(SheetContext);
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

export function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col space-y-1.5 p-4", className)} {...props} />;
}

export function SheetTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />;
}

export function SheetDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-muted-foreground", className)} {...props} />;
}

export function SheetFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mt-auto space-y-2 p-4", className)} {...props} />;
}
