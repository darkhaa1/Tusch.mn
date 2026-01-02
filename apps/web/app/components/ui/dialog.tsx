/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "../../lib/utils";

type DialogContextValue = {
  open: boolean;
  setOpen: (next: boolean) => void;
};

const DialogContext = React.createContext<DialogContextValue | null>(null);

type DialogProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
};

export function Dialog({ open: openProp, defaultOpen, onOpenChange, children }: DialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(Boolean(defaultOpen));
  const isControlled = typeof openProp === "boolean";
  const open = isControlled ? Boolean(openProp) : internalOpen;

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (!isControlled) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange]
  );

  return <DialogContext.Provider value={{ open, setOpen }}>{children}</DialogContext.Provider>;
}

export function DialogTrigger({
  asChild,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }) {
  const context = React.useContext(DialogContext);
  if (!context) {
    return (
      <button type="button" {...props}>
        {children}
      </button>
    );
  }
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as any, {
      onClick: (...args: any[]) => {
        context.setOpen(true);
        // @ts-ignore
        children.props?.onClick?.(...args);
      },
    });
  }
  return (
    <button
      type="button"
      onClick={() => context.setOpen(true)}
      {...props}
    >
      {children}
    </button>
  );
}

type DialogPortalProps = { children: React.ReactNode };
export function DialogPortal({ children }: DialogPortalProps) {
  if (typeof document === "undefined") return null;
  return createPortal(children, document.body);
}

export function DialogOverlay(props: React.HTMLAttributes<HTMLDivElement>) {
  const context = React.useContext(DialogContext);
  if (!context?.open) return null;
  return (
    <DialogPortal>
      <div
        {...props}
        className={cn(
          "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm data-[state=closed]:hidden",
          props.className
        )}
      />
    </DialogPortal>
  );
}

type DialogContentProps = React.HTMLAttributes<HTMLDivElement> & { className?: string };
export function DialogContent({ className, children, ...props }: DialogContentProps) {
  const context = React.useContext(DialogContext);
  if (!context?.open) return null;
  return (
    <DialogPortal>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div
          className={cn(
            "relative w-full max-w-lg rounded-lg border border-border/80 bg-background p-6 shadow-xl",
            className
          )}
          {...props}
        >
          {children}
        </div>
      </div>
    </DialogPortal>
  );
}

export function DialogHeader(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-1.5", props.className)} {...props} />;
}

export function DialogFooter(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end", props.className)} {...props} />;
}

export function DialogTitle(props: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-lg font-semibold leading-none tracking-tight", props.className)} {...props} />;
}

export function DialogDescription(props: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-muted-foreground", props.className)} {...props} />;
}

export function DialogClose({
  asChild,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }) {
  const context = React.useContext(DialogContext);
  if (!context) {
    return (
      <button type="button" {...props}>
        {children}
      </button>
    );
  }
  const handleClose = (...args: any[]) => {
    context.setOpen(false);
    // @ts-ignore
    if (typeof props.onClick === "function") props.onClick(...args);
  };
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as any, {
      onClick: handleClose,
    });
  }
  return (
    <button type="button" onClick={handleClose} {...props}>
      {children}
    </button>
  );
}

export { DialogContext };
