import { Badge, Button } from "@web/components/ui";
import { cn } from "@web/lib/utils";

type PaginationProps = {
  page: number;
  totalPages?: number;
  hasPrevious: boolean;
  hasNext: boolean;
  isBusy?: boolean;
  onPageChange: (page: number) => void;
  previousLabel?: string;
  nextLabel?: string;
  className?: string;
};

export function Pagination({
  page,
  totalPages,
  hasPrevious,
  hasNext,
  isBusy,
  onPageChange,
  previousLabel = "Previous",
  nextLabel = "Next",
  className,
}: PaginationProps) {
  const showTotal = typeof totalPages === "number" && totalPages > 0;

  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", className)}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page - 1)}
        disabled={!hasPrevious || isBusy}
        className="min-w-[120px] ui-interactive"
      >
        {previousLabel}
      </Button>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Badge variant="outline" className="rounded-full border-border/80 px-3 py-1 text-xs font-medium">
          Page {page}
        </Badge>
        <span>{showTotal ? `/ ${totalPages}` : ""}</span>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page + 1)}
        disabled={!hasNext || isBusy}
        className="min-w-[120px] ui-interactive"
      >
        {nextLabel}
      </Button>
    </div>
  );
}

export default Pagination;
