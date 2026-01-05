"use client";

import { Badge, Button, Card, CardContent, Input, Select, Textarea } from "@repo/ui";
import type { ChangeEvent } from "react";

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
  onFieldChange: (field: keyof FormState, value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
  categories: Array<{ value: string; label: string }>;
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
            <Select value={formState.category} onChange={handleChange("category")} disabled={isSaving}>
              <option value="">Ангилал сонгох</option>
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </Select>
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
