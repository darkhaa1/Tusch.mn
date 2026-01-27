"use client";

import type { ComponentPropsWithoutRef } from "react";
import { Card, CardContent } from "./card";
import { cn } from "@web/lib/utils";

type InteractiveCardProps = ComponentPropsWithoutRef<typeof Card> & {
  contentProps?: ComponentPropsWithoutRef<typeof CardContent>;
  children: ComponentPropsWithoutRef<typeof CardContent>["children"];
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
