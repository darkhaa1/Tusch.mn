"use client";

import { cn } from "@web/lib/utils";
import { CATEGORY_OPTIONS } from "@web/lib/category-ui";

type Props = {
  value: string;
  onSelect: (value: string) => void;
  error?: string;
};

export default function NewListingStepCategory({ value, onSelect, error }: Props) {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">Ангилал</p>
        <p className="text-xs text-muted-foreground">Зарын ангиллыг сонгоно уу.</p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {CATEGORY_OPTIONS.map((category) => {
          const Icon = category.icon;
          const active = value === category.value;
          return (
            <button
              key={category.value}
              type="button"
              onClick={() => onSelect(category.value)}
              className={cn(
                "flex h-20 flex-col items-start justify-between rounded-xl border p-3 text-left transition",
                active
                  ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                  : "border-border hover:border-primary/40",
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              />
              <span className="text-sm font-medium text-foreground">
                {category.label}
              </span>
            </button>
          );
        })}
      </div>
      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : (
        <p className="text-xs text-muted-foreground">
          Сонгосон ангилал: {value || "Сонгоогүй"}
        </p>
      )}
    </div>
  );
}
