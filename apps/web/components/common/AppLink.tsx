"use client";

import Link, { LinkProps } from "next/link";
import { cn } from "../../app/lib/utils";
import { HTMLAttributes } from "react";

type AppLinkProps = LinkProps & HTMLAttributes<HTMLAnchorElement>;

export function AppLink({ className, children, ...props }: AppLinkProps) {
  return (
    <Link {...props} className={cn("ui-link", className)}>
      {children}
    </Link>
  );
}
