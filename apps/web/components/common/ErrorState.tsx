import { RefreshCcw } from "lucide-react";
import type { ComponentProps } from "react";
import { Alert, AlertDescription, AlertTitle, buttonVariants } from "@repo/ui";
import { cn } from "../../app/lib/utils";

type AlertTitleChildren = ComponentProps<typeof AlertTitle>["children"];
type AlertDescriptionChildren = ComponentProps<typeof AlertDescription>["children"];
type ButtonChildren = ComponentProps<"button">["children"];
type ErrorStateProps = {
  title?: AlertTitleChildren;
  message: AlertDescriptionChildren;
  onRetry?: () => void;
  isRetrying?: boolean;
  retryLabel?: ButtonChildren;
};

/**
 * Standardized error state with optional retry action.
 */
export function ErrorState({
  title,
  message,
  onRetry,
  isRetrying,
  retryLabel,
}: ErrorStateProps) {
  return (
    <Alert>
      {title ? <AlertTitle>{title}</AlertTitle> : null}
      <AlertDescription className="text-sm text-destructive">{message}</AlertDescription>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          disabled={isRetrying}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "mt-3 gap-2 text-destructive"
          )}
        >
          <RefreshCcw className="h-4 w-4" aria-hidden="true" />
          {retryLabel || "Дахин оролдох"}
        </button>
      ) : null}
    </Alert>
  );
}

export default ErrorState;
