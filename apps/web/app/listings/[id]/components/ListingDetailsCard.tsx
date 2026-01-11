"use client";

import { Badge, Button, Card, CardContent, Input, Textarea } from "@repo/ui";
import type { ChangeEvent } from "react";
import type { CategoryOption } from "../../../lib/categories";
import { cn } from "../../../lib/utils";

type FormState = {
  description: string;
  price: string;
  location: string;
  category: string;
};

type ListingDetailsCardProps = {
  heading: string;
  categoryLabel: string | null;
  listingDescription: string;
  isEditing: boolean;
  formState: FormState;
  // eslint-disable-next-line no-unused-vars
  onFieldChange: (field: keyof FormState, value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
  categories: CategoryOption[];
  formError?: string | null;
};

export function ListingDetailsCard({
  heading,
  categoryLabel,
  listingDescription,
  isEditing,
  formState,
  onFieldChange,
  onSave,
  onCancel,
  isSaving,
  categories,
  formError,
}: ListingDetailsCardProps) {
  const handleChange =
    (field: keyof FormState) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      onFieldChange(field, event.target.value);
    };

  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold leading-tight text-foreground">{heading}</h1>
          {categoryLabel ? <Badge variant="secondary">{categoryLabel}</Badge> : null}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {/* Placeholder for future meta */}
        </div>

        {isEditing ? (
          <div className="space-y-3">
            <Textarea
              rows={6}
              value={formState.description}
              onChange={handleChange("description")}
              disabled={isSaving}
              placeholder="Тайлбараа оруулна уу..."
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                type="number"
                value={formState.price}
                onChange={handleChange("price")}
                disabled={isSaving}
                placeholder="Үнэ"
              />
              <Input
                value={formState.location}
                onChange={handleChange("location")}
                disabled={isSaving}
                placeholder="Байршил"
              />
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {categories.map((category) => {
                const isSelected = formState.category === category.value;
                return (
                  <button
                    key={category.value}
                    type="button"
                    onClick={() => onFieldChange("category", category.value)}
                    className={cn(
                      "flex items-center justify-center rounded-md border px-3 py-2 text-center text-xs font-medium transition",
                      isSelected ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/60"
                    )}
                    disabled={isSaving}
                  >
                    {category.label}
                  </button>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <Button onClick={onSave} disabled={isSaving}>
                Хадгалах
              </Button>
              <Button variant="outline" onClick={onCancel} disabled={isSaving}>
                Цуцлах
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-base leading-relaxed text-foreground">{listingDescription}</p>
        )}

        {formError && <p className="text-sm text-destructive">{formError}</p>}
      </CardContent>
    </Card>
  );
}
