"use client";

import { Card, CardContent, CardContentProps, CardProps } from "@repo/ui";
import { cn } from "../../app/lib/utils";

type InteractiveCardProps = CardProps & {
  contentProps?: CardContentProps;
  children: React.ReactNode;
};

export function InteractiveCard({ className, contentProps, children, ...props }: InteractiveCardProps) {
  return (
    <Card className={cn("ui-card", className)} {...props}>
      <CardContent {...contentProps}>{children}</CardContent>
    </Card>
  );
}
