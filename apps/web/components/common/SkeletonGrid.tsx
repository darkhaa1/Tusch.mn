import { Card, CardContent, Skeleton } from "@repo/ui";

type SkeletonGridProps = {
  count: number;
  className?: string;
};

/**
 * Generic grid skeleton for card-based lists.
 */
export function SkeletonGrid({ count, className }: SkeletonGridProps) {
  return (
    <div
      className={`grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${className || ""}`}
      aria-busy="true"
      aria-live="polite"
    >
      {Array.from({ length: count }).map((_, index) => (
        <Card key={`skeleton-${index}`} className="overflow-hidden">
          <Skeleton className="aspect-[4/3] w-full rounded-none" />
          <CardContent className="space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-9 w-full rounded-md" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default SkeletonGrid;
