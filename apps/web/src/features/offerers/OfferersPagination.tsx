"use client";

import { Badge, Button } from "@web/components/ui";

type Props = {
  page: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
  isFetching: boolean;
  onPageChange: (page: number) => void;
};

export default function OfferersPagination({
  page,
  totalPages,
  hasPrevious,
  hasNext,
  isFetching,
  onPageChange,
}: Props) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page - 1)}
        disabled={!hasPrevious || isFetching}
        className="min-w-30"
      >
        Өмнөх
      </Button>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Badge
          variant="outline"
          className="rounded-full border-border/80 px-3 py-1 text-xs font-medium"
        >
          Хуудас {page}
        </Badge>
        <span>/ {totalPages}</span>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page + 1)}
        disabled={!hasNext || isFetching}
        className="min-w-30"
      >
        Дараах
      </Button>
    </div>
  );
}
