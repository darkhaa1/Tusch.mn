"use client";

/**
 * Step 3 — Details (description + location) — Atelier redesign (SA-8).
 * Mono eyebrow + serif italic heading; description textarea ink-bordered;
 * location input ink-bordered. Validation logic preserved.
 */

import type { UseFormRegister, FieldErrors } from "react-hook-form";
import { LabelMono } from "@web/components/ui-v2";

type Props = {
  register: UseFormRegister<any>;
  errors: FieldErrors<{ description: string; location: string }>;
  disabled: boolean;
};

const labels = {
  eyebrow: "Үе шат 3 · Дэлгэрэнгүй",
  title: "Юу хэрэгтэйгээ",
  titleEm: "тайлбарла.",
  subtitle:
    "Илүү тодорхой бичих тусам мэргэжилтнүүд илүү сайн санал болгоно.",
  descLabel: "Тайлбар",
  descPlaceholder:
    "Жишээ: 22 м² зочны өрөөнд паркетан шал тавих. Царс модыг өөрөө худалдаж авсан. 6 сарын эхний долоо хоногт хийвэл сайн.",
  locLabel: "Байршил",
  locOptional: "Заавал биш",
  locPlaceholder: "Жнь: Хан-Уул, 11-р хороо",
};

export default function NewListingStepDetails({
  register,
  errors,
  disabled,
}: Props) {
  const descErr = errors.description?.message as string | undefined;
  const locErr = errors.location?.message as string | undefined;

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
        <LabelMono className="mb-2 block">{labels.descLabel}</LabelMono>
        <textarea
          rows={5}
          placeholder={labels.descPlaceholder}
          {...register("description")}
          disabled={disabled}
          className={
            (descErr ? "border-atelier-pourpre " : "border-atelier-ink ") +
            "block w-full bg-atelier-paper px-3 py-3 text-[14px] leading-[1.55] text-atelier-ink placeholder:text-atelier-muted outline-none border focus:ring-2 focus:ring-atelier-ink/30 disabled:opacity-50"
          }
          style={{ fontFamily: "var(--at-serif)" }}
        />
        {descErr ? (
          <p
            className="mt-2 text-[12px] italic text-atelier-pourpre"
            style={{ fontFamily: "var(--at-serif)" }}
          >
            {descErr}
          </p>
        ) : null}
      </div>

      <div className="border-t border-atelier-line pt-5">
        <div className="mb-2 flex items-baseline justify-between">
          <LabelMono>{labels.locLabel}</LabelMono>
          <span
            className="text-[10px] uppercase tracking-[0.15em] text-atelier-muted"
            style={{ fontFamily: "var(--at-mono)" }}
          >
            {labels.locOptional}
          </span>
        </div>
        <input
          type="text"
          placeholder={labels.locPlaceholder}
          {...register("location")}
          disabled={disabled}
          className={
            (locErr ? "border-atelier-pourpre " : "border-atelier-ink ") +
            "block w-full bg-atelier-paper px-3 py-3 text-[14px] text-atelier-ink placeholder:text-atelier-muted outline-none border focus:ring-2 focus:ring-atelier-ink/30 disabled:opacity-50"
          }
          style={{ fontFamily: "var(--at-serif)" }}
        />
        {locErr ? (
          <p
            className="mt-2 text-[12px] italic text-atelier-pourpre"
            style={{ fontFamily: "var(--at-serif)" }}
          >
            {locErr}
          </p>
        ) : null}
      </div>
    </div>
  );
}
