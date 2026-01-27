"use client";

import {
  cloneElement,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useState,
} from "react";
import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  MouseEvent as ReactMouseEvent,
  ReactElement,
  ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@web/lib/utils";

type DialogContextValue = {
  open: boolean;
  setOpen: (_next: boolean) => void;
};

const DialogContext = createContext<DialogContextValue | null>(null);

type DialogProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (_open: boolean) => void;
  children: ReactNode;
};

export function Dialog({ open: openProp, defaultOpen, onOpenChange, children }: DialogProps) {
  const [internalOpen, setInternalOpen] = useState(Boolean(defaultOpen));
  const isControlled = typeof openProp === "boolean";
  const open = isControlled ? Boolean(openProp) : internalOpen;

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange]
  );

  return <DialogContext.Provider value={{ open, setOpen }}>{children}</DialogContext.Provider>;
}

type ClickHandler = (event: ReactMouseEvent<HTMLElement>) => void;
type ClickableChild = ReactElement<{ onClick?: ClickHandler }>;

type DialogTriggerProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> & {
  asChild?: boolean;
  onClick?: ClickHandler;
};

export function DialogTrigger({
  asChild,
  children,
  ...props
}: DialogTriggerProps) {
  const context = useContext(DialogContext);
  if (!context) {
    return (
      <button type="button" {...props}>
        {children}
      </button>
    );
  }
  if (asChild && isValidElement(children)) {
    const child = children as ClickableChild;
    return cloneElement(child, {
      onClick: (event) => {
        context.setOpen(true);
        child.props.onClick?.(event);
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

type DialogPortalProps = { children: ReactNode };
export function DialogPortal({ children }: DialogPortalProps) {
  if (typeof document === "undefined") return null;
  return createPortal(children, document.body);
}

export function DialogOverlay(props: HTMLAttributes<HTMLDivElement>) {
  const context = useContext(DialogContext);
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

type DialogContentProps = HTMLAttributes<HTMLDivElement> & { className?: string };
export function DialogContent({ className, children, ...props }: DialogContentProps) {
  const context = useContext(DialogContext);
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

export function DialogHeader(props: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-1.5", props.className)} {...props} />;
}

export function DialogFooter(props: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end", props.className)} {...props} />;
}

export function DialogTitle(props: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-lg font-semibold leading-none tracking-tight", props.className)} {...props} />;
}

export function DialogDescription(props: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-muted-foreground", props.className)} {...props} />;
}

export function DialogClose({
  asChild,
  children,
  ...props
}: DialogTriggerProps) {
  const context = useContext(DialogContext);
  if (!context) {
    return (
      <button type="button" {...props}>
        {children}
      </button>
    );
  }
  const handleClose: ClickHandler = (event) => {
    context.setOpen(false);
    props.onClick?.(event);
  };
  if (asChild && isValidElement(children)) {
    return cloneElement(children as ClickableChild, { onClick: handleClose });
  }
  return (
    <button type="button" onClick={handleClose} {...props}>
      {children}
    </button>
  );
}

export { DialogContext };
