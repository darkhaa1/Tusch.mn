"use client";

/**
 * Step 4 — Images — Atelier redesign (SA-8).
 * Mono eyebrow, serif italic heading. Image slots are square cells; the empty
 * slot uses a dashed muted border + serif "+" glyph. Upload logic untouched.
 */

import type { ChangeEvent, RefObject } from "react";
import { LabelMono } from "@web/components/ui-v2";

type Props = {
  files: File[];
  fileInputRef: RefObject<HTMLInputElement | null>;
  onFilesChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: (index: number) => void;
  onOpenPicker: () => void;
  isPending: boolean;
};

const labels = {
  eyebrow: "Үе шат 4 · Зураг",
  title: "Ажлын талаар",
  titleEm: "зураг нэмэх үү?",
  subtitle:
    "3 хүртэл зураг оруулж болно. Зураг нь мэргэжилтнүүдэд тусална.",
  countLabel: "Зураг",
  remove: "Устгах",
  add: "Зураг нэмэх",
};

const MAX_SLOTS = 3;

export default function NewListingStepImages({
  files,
  fileInputRef,
  onFilesChange,
  onRemoveFile,
  onOpenPicker,
  isPending,
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
        <div className="mb-3 flex items-baseline justify-between">
          <LabelMono>
            {labels.countLabel} · {files.length} / {MAX_SLOTS}
          </LabelMono>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: MAX_SLOTS }).map((_, idx) => {
            const file = files[idx];
            if (file) {
              return (
                <div
                  key={`${file.name}-${idx}`}
                  className="relative aspect-square overflow-hidden border border-atelier-ink bg-atelier-cream"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => onRemoveFile(idx)}
                    disabled={isPending}
                    className="absolute right-1 top-1 bg-atelier-ink/85 text-atelier-cream px-2 py-0.5 text-[10px] uppercase tracking-widest"
                    style={{ fontFamily: "var(--at-mono)" }}
                  >
                    {labels.remove}
                  </button>
                </div>
              );
            }
            return (
              <button
                key={`empty-${idx}`}
                type="button"
                onClick={onOpenPicker}
                disabled={isPending}
                className="flex aspect-square flex-col items-center justify-center gap-1 border border-dashed border-atelier-muted bg-transparent text-atelier-muted transition hover:border-atelier-ink hover:text-atelier-ink disabled:opacity-50"
              >
                <span
                  className="text-[28px] leading-none"
                  style={{ fontFamily: "var(--at-serif)" }}
                  aria-hidden="true"
                >
                  +
                </span>
                <span
                  className="text-[10px] uppercase tracking-[0.15em]"
                  style={{ fontFamily: "var(--at-mono)" }}
                >
                  {labels.add}
                </span>
              </button>
            );
          })}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={onFilesChange}
          disabled={isPending}
        />
      </div>
    </div>
  );
}
