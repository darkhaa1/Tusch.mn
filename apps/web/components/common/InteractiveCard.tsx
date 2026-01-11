"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { Card, CardContent } from "@repo/ui";
import { cn } from "../../app/lib/utils";

type InteractiveCardProps = ComponentPropsWithoutRef<typeof Card> & {
  contentProps?: ComponentPropsWithoutRef<typeof CardContent>;
  children: ReactNode;
};

export function InteractiveCard({
  className,
  contentProps,
  children,
  ...props
}: InteractiveCardProps) {
  return (
    <Card className={cn("ui-card", className)} {...props}>
      <CardContent {...contentProps}>{children}</CardContent>
    </Card>
  );
}
