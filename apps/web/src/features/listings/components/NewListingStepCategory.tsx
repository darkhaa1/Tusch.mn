"use client";

/**
 * Step 1 — Category — Atelier redesign (SA-8).
 * Mono-caps eyebrow, serif italic headline, category chips (ink filled when active,
 * italic ink-cream label; line-outline otherwise). Validation logic unchanged.
 */

import { CATEGORY_OPTIONS } from "@web/lib/category-ui";
import { LabelMono } from "@web/components/ui-v2";

type Props = {
  value: string;
  onSelect: (value: string) => void;
  error?: string;
};

const labels = {
  eyebrow: "Үе шат 1 · Ангилал",
  title: "Та ямар",
  titleEm: "үйлчилгээ хайж байна?",
  subtitle:
    "Тохирох ангиллыг сонгосноор мэргэжилтнүүд таны зарыг хурдан олно.",
  sectionLabel: "Ангилал",
  selectedLabel: "Сонгосон",
  none: "Сонгоогүй",
};

export default function NewListingStepCategory({
  value,
  onSelect,
  error,
}: Props) {
  const selected = CATEGORY_OPTIONS.find((c) => c.value === value);

  return (
    <div className="space-y-7">
      <div className="space-y-2">
        <LabelMono>{labels.eyebrow}</LabelMono>
        <h2
          className="text-[26px] leading-[1.15] tracking-[-0.5px] text-atelier-ink md:text-3xl"
          style={{ fontFamily: "var(--at-serif)" }}
        >
          {labels.title}{" "}
          <em
            style={{ fontStyle: "italic", fontFamily: "var(--at-serif)" }}
          >
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
        <LabelMono className="mb-3 block">{labels.sectionLabel}</LabelMono>
        <div className="flex flex-wrap gap-2">
          {CATEGORY_OPTIONS.map((category) => {
            const active = value === category.value;
            return (
              <button
                key={category.value}
                type="button"
                onClick={() => onSelect(category.value)}
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
                {category.label}
              </button>
            );
          })}
        </div>
      </div>

      {error ? (
        <p
          className="text-[12px] italic text-atelier-pourpre"
          style={{ fontFamily: "var(--at-serif)" }}
        >
          {error}
        </p>
      ) : (
        <p
          className="text-[11px] uppercase tracking-[0.15em] text-atelier-muted"
          style={{ fontFamily: "var(--at-mono)" }}
        >
          {labels.selectedLabel}:{" "}
          <span className="text-atelier-ink">
            {selected ? selected.label : labels.none}
          </span>
        </p>
      )}
    </div>
  );
}
