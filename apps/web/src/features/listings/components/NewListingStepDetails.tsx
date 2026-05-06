"use client";

import type { UseFormRegister, FieldErrors } from "react-hook-form";
import { Input, Textarea } from "@web/components/ui";

type Props = {
  register: UseFormRegister<any>;
  errors: FieldErrors<{ description: string; location: string }>;
  disabled: boolean;
};

export default function NewListingStepDetails({ register, errors, disabled }: Props) {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">Тайлбар</p>
        <p className="text-xs text-muted-foreground">
          Бараа/үйлчилгээний онцлог, нөхцөл, бусад мэдээллээ дэлгэрэнгүй бичнэ үү.
        </p>
      </div>
      <Textarea
        rows={5}
        className="text-base"
        placeholder="Жишээ: 2 өрөө байр түрээслэнэ, төвд, тохижилттой..."
        {...register("description")}
        disabled={disabled}
      />
      {errors.description && (
        <p className="text-sm text-destructive">{errors.description.message as string}</p>
      )}

      <div className="space-y-1 pt-2">
        <p className="text-sm font-medium text-foreground">Байршил</p>
        <Input
          className="h-12 text-base"
          placeholder="Хот, дүүрэг..."
          {...register("location")}
          disabled={disabled}
        />
        {errors.location && (
          <p className="text-sm text-destructive">{errors.location.message as string}</p>
        )}
      </div>
    </div>
  );
}
