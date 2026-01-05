import Link from "next/link";
import { Card, CardContent, buttonVariants } from "@repo/ui";
import { cn } from "../../app/lib/utils";

type EmptyStateProps = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  primaryAction?: React.ReactNode;
  secondaryHref?: string;
  secondaryLabel?: React.ReactNode;
  className?: string;
};

/**
 * Generic empty state card with optional primary action (button) and secondary link.
 * Keeps layout centered; text/content passed by caller to preserve existing copy.
 */
export function EmptyState({
  title,
  description,
  primaryAction,
  secondaryHref,
  secondaryLabel,
  className,
}: EmptyStateProps) {
  return (
    <Card className={cn("text-center", className)}>
      <CardContent className="flex flex-col items-center gap-3 py-8">
        {title ? <h2 className="text-lg font-semibold text-foreground">{title}</h2> : null}
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        {(primaryAction || secondaryHref) && (
          <div className="mt-2 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {secondaryHref && secondaryLabel ? (
              <Link
                href={secondaryHref}
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                {secondaryLabel}
              </Link>
            ) : null}
            {primaryAction}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default EmptyState;
