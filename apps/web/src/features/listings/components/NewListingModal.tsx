"use client";

/**
 * New listing wizard — Atelier redesign (SA-8).
 *
 * Mobile: full-screen paper sheet with header (× / "Үе шат N / M" mono caps /
 *   "Ноорог" terre eyebrow), scrolling body, and sticky footer with outline
 *   "← Буцах" + filled "Үргэлжлүүлэх".
 * Desktop: centered modal (max-w-2xl) with ink border, same internal rhythm
 *   and stacked progress dots above the header text.
 *
 * Zod schema, react-hook-form, useCreateListing mutation, and the file upload
 * pipeline are unchanged from the prior version — only presentation.
 */

import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { createPortal } from "react-dom";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod/v3";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateListing } from "@web/lib/hooks/useApi";
import { uploadListingImages } from "@web/lib/api/listings";
import type { Listing } from "@web/lib/api/types";
import { Button as AtButton, LabelMono } from "@web/components/ui-v2";
import NewListingStepCategory from "./NewListingStepCategory";
import NewListingStepPrice from "./NewListingStepPrice";
import NewListingStepDetails from "./NewListingStepDetails";
import NewListingStepImages from "./NewListingStepImages";

const ListingSchema = z.object({
  category: z.string().min(1, "Ангиллыг заавал сонгоно уу."),
  description: z
    .string()
    .min(10, "Тайлбар дор хаяж 10 тэмдэгттэй байх ёстой."),
  price: z
    .number()
    .int()
    .nonnegative("Үнэ 0 эсвэл түүнээс дээш бүхэл тоо байх ёстой."),
  location: z.string().optional(),
});

type ListingForm = z.infer<typeof ListingSchema>;

type NewListingModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const STEPS_TOTAL = 4;

const labels = {
  draft: "Ноорог",
  step: "Үе шат",
  back: "← Буцах",
  next: "Үргэлжлүүлэх",
  submit: "Илгээх",
  submitting: "Илгээж байна…",
  close: "Хаах",
  unverifiedEmail: "Имэйлээ баталгаажуулсны дараа зар нийтлэх боломжтой.",
  defaultError: "Алдаа гарлаа",
  emailVerifyKey: "Имэйл баталгаажуулна уу",
};

export default function NewListingModal({
  isOpen,
  onClose,
}: NewListingModalProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [step, setStep] = useState(1);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const {
    control,
    register,
    handleSubmit,
    setValue,
    trigger,
    formState: { errors },
    reset,
  } = useForm<ListingForm>({
    resolver: zodResolver(ListingSchema),
    defaultValues: { category: "", description: "", price: 0, location: "" },
  });

  const mutation = useCreateListing();
  const categoryValue = useWatch({ control, name: "category" });
  const priceValue = useWatch({ control, name: "price" });

  const onSubmit = async (data: ListingForm) => {
    setSubmitError(null);
    try {
      const listing = (await mutation.mutateAsync(data)) as Listing | undefined;
      if (files.length > 0 && listing?.id) {
        await uploadListingImages(listing.id, files.slice(0, 3));
      }
      reset();
      setFiles([]);
      setStep(1);
      onClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : labels.defaultError;
      setSubmitError(
        message === labels.emailVerifyKey ? labels.unverifiedEmail : message,
      );
    }
  };

  const handleFilesChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files || []);
    if (selected.length === 0) return;
    setFiles((prev) => [...prev, ...selected].slice(0, 3));
  };

  const removeFile = (index: number) =>
    setFiles((prev) => prev.filter((_, i) => i !== index));

  const openFilePicker = () => {
    if (mutation.isPending) return;
    fileInputRef.current?.click();
  };

  const goNext = async () => {
    if (step === 1 && !(await trigger("category"))) return;
    if (step === 2 && !(await trigger("price"))) return;
    if (step === 3 && !(await trigger(["description", "location"]))) return;

    if (step < STEPS_TOTAL) {
      setStep((prev) => prev + 1);
    } else {
      handleSubmit(onSubmit)();
    }
  };

  const goBack = () => {
    if (step > 1) setStep((prev) => prev - 1);
  };

  const handleClose = () => {
    if (mutation.isPending) return;
    onClose();
  };

  if (!isOpen) return null;

  const isLast = step === STEPS_TOTAL;
  const pending = mutation.isPending;

  return createPortal(
    <div className="fixed inset-0 z-50 flex md:items-center md:justify-center md:p-6">
      {/* Backdrop — only on desktop modal */}
      <button
        type="button"
        aria-label={labels.close}
        onClick={handleClose}
        className="absolute inset-0 hidden bg-atelier-ink/40 md:block"
      />

      {/* Wizard surface */}
      <div
        className="relative z-10 flex h-full w-full flex-col bg-atelier-cream md:h-auto md:max-h-[88vh] md:w-full md:max-w-2xl md:border md:border-atelier-ink md:bg-atelier-paper md:shadow-2xl"
        style={{ fontFamily: "var(--at-sans)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 md:px-8 md:pt-6">
          <button
            type="button"
            onClick={handleClose}
            aria-label={labels.close}
            disabled={pending}
            className="text-atelier-ink text-[22px] leading-none disabled:opacity-40"
            style={{ fontFamily: "var(--at-serif)" }}
          >
            ×
          </button>
          <LabelMono tone="muted">
            {labels.step} {step} / {STEPS_TOTAL}
          </LabelMono>
          <LabelMono tone="terre">{labels.draft}</LabelMono>
        </div>

        {/* Progress dots — desktop only (mobile uses the mono "step N / M"). */}
        <div className="hidden md:block md:px-8">
          <div className="flex items-center gap-2 pt-1 pb-2">
            {Array.from({ length: STEPS_TOTAL }).map((_, i) => {
              const idx = i + 1;
              const filled = idx <= step;
              return (
                <span
                  key={i}
                  className={
                    "h-0.75 flex-1 " +
                    (filled ? "bg-atelier-ink" : "bg-atelier-line")
                  }
                />
              );
            })}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 md:px-8 md:py-6">
          {submitError ? (
            <div
              className="mb-5 border border-atelier-pourpre bg-atelier-paper px-4 py-3 text-[13px] italic text-atelier-pourpre"
              style={{ fontFamily: "var(--at-serif)" }}
              role="alert"
            >
              {submitError}
            </div>
          ) : null}

          {step === 1 && (
            <NewListingStepCategory
              value={categoryValue}
              onSelect={(val) =>
                setValue("category", val, { shouldValidate: true })
              }
              error={errors.category?.message}
            />
          )}
          {step === 2 && (
            <NewListingStepPrice
              register={register}
              priceValue={priceValue}
              setValue={setValue}
              error={errors.price?.message}
              disabled={pending}
            />
          )}
          {step === 3 && (
            <NewListingStepDetails
              register={register}
              errors={errors}
              disabled={pending}
            />
          )}
          {step === 4 && (
            <NewListingStepImages
              files={files}
              fileInputRef={fileInputRef}
              onFilesChange={handleFilesChange}
              onRemoveFile={removeFile}
              onOpenPicker={openFilePicker}
              isPending={pending}
            />
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-atelier-line bg-atelier-cream px-5 py-3 md:bg-atelier-paper md:px-8 md:py-4">
          <div className="flex items-center gap-3">
            <AtButton
              type="button"
              variant="outline"
              italic
              onClick={step === 1 ? handleClose : goBack}
              disabled={pending}
            >
              {labels.back}
            </AtButton>
            <div className="flex-1" />
            <AtButton
              type={isLast ? "submit" : "button"}
              variant="primary"
              onClick={goNext}
              disabled={pending}
              className="min-w-40"
            >
              {pending
                ? labels.submitting
                : isLast
                  ? labels.submit
                  : labels.next}
            </AtButton>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
