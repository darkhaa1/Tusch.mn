"use client";

/**
 * Step 2 — Price — Atelier redesign (SA-8).
 * Mono eyebrow + serif italic heading + ink-bordered numeric input.
 * Preset chips use italic serif. Validation logic unchanged.
 */

import type { UseFormRegister, UseFormSetValue } from "react-hook-form";
import { LabelMono } from "@web/components/ui-v2";

type Props = {
  register: UseFormRegister<any>;
  priceValue: number;
  setValue: UseFormSetValue<any>;
  error?: string;
  disabled: boolean;
};

const PRICE_PRESETS = [0, 20000, 50000, 100000];

const labels = {
  eyebrow: "Үе шат 2 · Үнэ",
  title: "Хэдэн төгрөгөөр",
  titleEm: "санал бодохыг хүсч байна?",
  subtitle:
    "Бодит үнэ оруулбал илүү тохирох мэргэжилтнүүд таныг олно.",
  sectionLabel: "Үнэ · MNT",
  presetsLabel: "Түргэн сонголт",
};

export default function NewListingStepPrice({
  register,
  priceValue,
  setValue,
  error,
  disabled,
}: Props) {
  return (
    <div className="space-y-7">
      <div className="space-y-2">
        <LabelMono>{labels.eyebrow}</LabelMono>
        <h2
          className="text-[26px] leading-[1.15] tracking-[-0.5px] text-atelier-ink md:text-3xl"
          style={{ fontFamily: "var(--at-serif)" }}
        >
          {labels.title}{" "}
          <em style={{ fontStyle: "italic", fontFamily: "var(--at-serif)" }}>
            {labels.titleEm}
          </em>
        </h2>
        <p
          className="text-[13px] italic text-atelier-muted"
          style={{ fontFamily: "var(--at-serif)" }}
        >
          {labels.subtitle}
        </p>
      </div>

      <div className="border-t border-atelier-line pt-5">
        <LabelMono className="mb-2 block">{labels.sectionLabel}</LabelMono>
        <div
          className={
            (error
              ? "border-atelier-pourpre "
              : "border-atelier-ink ") +
            "flex items-center gap-2 border bg-atelier-paper px-3 py-3 focus-within:ring-2 focus-within:ring-atelier-ink/30"
          }
        >
          <input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="0"
            {...register("price", { valueAsNumber: true })}
            disabled={disabled}
            className="min-w-0 flex-1 bg-transparent text-[17px] text-atelier-ink placeholder:text-atelier-muted outline-none border-0"
            style={{ fontFamily: "var(--at-serif)" }}
          />
          <span
            className="text-[10px] uppercase tracking-[0.15em] text-atelier-muted"
            style={{ fontFamily: "var(--at-mono)" }}
          >
            MNT
          </span>
        </div>
        {error ? (
          <p
            className="mt-2 text-[12px] italic text-atelier-pourpre"
            style={{ fontFamily: "var(--at-serif)" }}
          >
            {error}
          </p>
        ) : null}
      </div>

      <div className="border-t border-atelier-line pt-5">
        <LabelMono className="mb-3 block">{labels.presetsLabel}</LabelMono>
        <div className="flex flex-wrap gap-2">
          {PRICE_PRESETS.map((preset) => {
            const active = priceValue === preset;
            return (
              <button
                key={preset}
                type="button"
                onClick={() =>
                  setValue("price", preset, { shouldValidate: true })
                }
                disabled={disabled}
                className={
                  active
                    ? "bg-atelier-ink text-atelier-cream px-3 py-1.5 text-[13px] border border-transparent"
                    : "bg-transparent text-atelier-ink border border-atelier-line px-3 py-1.5 text-[13px] hover:border-atelier-ink"
                }
                style={{
                  fontFamily: "var(--at-serif)",
                  fontStyle: "italic",
                }}
              >
                {preset === 0
                  ? "Үнэгүй"
                  : `${preset.toLocaleString()} MNT`}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
