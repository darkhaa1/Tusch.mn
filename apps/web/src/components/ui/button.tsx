"use client";

import { cloneElement, forwardRef, isValidElement } from "react";
import type { ButtonHTMLAttributes, MouseEvent as ReactMouseEvent, ReactElement } from "react";
import { cn } from "@web/lib/utils";

type ButtonVariant = "default" | "secondary" | "outline" | "ghost" | "destructive";
type ButtonSize = "default" | "sm" | "lg" | "icon";

function buttonVariants({
  variant = "default",
  size = "default",
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
} = {}) {
  const base =
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors transition-shadow transition-transform hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0.5";
  const focus =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background";
  const disabled = "disabled:pointer-events-none disabled:opacity-50";

  const variants: Record<ButtonVariant, string> = {
    default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
    secondary: "bg-secondary text-secondary-foreground shadow hover:bg-secondary/90",
    outline:
      "border border-input bg-background text-foreground hover:bg-muted/60 hover:text-foreground",
    ghost: "bg-transparent hover:bg-muted/60 hover:text-foreground",
    destructive: "bg-destructive text-destructive-foreground shadow hover:bg-destructive/90",
  };

  const sizes: Record<ButtonSize, string> = {
    default: "h-10 px-4 py-2",
    sm: "h-9 px-3",
    lg: "h-11 px-5",
    icon: "h-10 w-10",
  };

  return cn(base, focus, disabled, variants[variant], sizes[size]);
}

type ClickHandler = (event: ReactMouseEvent<HTMLElement>) => void;
type ClickableChild = ReactElement<{ className?: string; onClick?: ClickHandler }>;

const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    size?: ButtonSize;
    asChild?: boolean;
  }
>(
  ({ className, variant = "default", size = "default", asChild, children, onClick, ...props }, ref) => {
    const classes = cn(buttonVariants({ variant, size }), className);

    if (asChild && isValidElement(children)) {
      const child = children as ClickableChild;
      const handleClick: ClickHandler | undefined =
        onClick || child.props.onClick
          ? (event) => {
              onClick?.(event as unknown as ReactMouseEvent<HTMLButtonElement>);
              child.props.onClick?.(event);
            }
          : undefined;

      return cloneElement(child, {
        className: cn(classes, child.props.className),
        onClick: handleClick,
        ...props,
      });
    }

    return (
      <button ref={ref} className={classes} onClick={onClick} {...props}>
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
