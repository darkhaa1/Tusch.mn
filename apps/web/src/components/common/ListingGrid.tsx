import type { ReactNode } from "react";
import { cn } from "@web/lib/utils";

type ListingGridProps = {
  children: ReactNode;
  className?: string;
};

export function ListingGrid({ children, className }: ListingGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        className
      )}
    >
      {children}
    </div>
  );
}

export default ListingGrid;
