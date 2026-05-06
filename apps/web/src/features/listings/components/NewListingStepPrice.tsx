"use client";

import type { UseFormRegister, UseFormSetValue } from "react-hook-form";
import { Button, Input } from "@web/components/ui";

type FormValues = { price: number };

type Props = {
  register: UseFormRegister<any>;
  priceValue: number;
  setValue: UseFormSetValue<any>;
  error?: string;
  disabled: boolean;
};

const PRICE_PRESETS = [0, 20000, 50000, 100000];

export default function NewListingStepPrice({
  register,
  priceValue,
  setValue,
  error,
  disabled,
}: Props) {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">Үнэ</p>
        <p className="text-xs text-muted-foreground">
          0-ээс дээш бүхэл тоогор оруулна уу.
        </p>
      </div>
      <Input
        type="number"
        inputMode="numeric"
        min={0}
        className="h-12 text-base"
        placeholder="Үнэ (MNT)"
        {...register("price", { valueAsNumber: true })}
        disabled={disabled}
      />
      <div className="flex flex-wrap gap-2">
        {PRICE_PRESETS.map((preset) => (
          <Button
            key={preset}
            type="button"
            variant={priceValue === preset ? "default" : "outline"}
            size="sm"
            onClick={() => setValue("price", preset, { shouldValidate: true })}
          >
            {preset === 0 ? "Үнэгүй" : `${preset.toLocaleString()} MNT`}
          </Button>
        ))}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
