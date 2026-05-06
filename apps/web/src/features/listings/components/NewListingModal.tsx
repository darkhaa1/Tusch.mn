"use client";

import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { createPortal } from "react-dom";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod/v3";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateListing } from "@web/lib/hooks/useApi";
import { uploadListingImages } from "@web/lib/api/listings";
import type { Listing } from "@web/lib/api/types";
import { Badge, Button } from "@web/components/ui";
import { X, ArrowLeft } from "lucide-react";
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

export default function NewListingModal({ isOpen, onClose }: NewListingModalProps) {
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
      const message = err instanceof Error ? err.message : "Алдаа гарлаа";
      setSubmitError(
        message === "Имэйл баталгаажуулна уу"
          ? "Имэйлээ баталгаажуулсны дараа зар нийтлэх боломжтой."
          : message,
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

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center px-2">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => (!mutation.isPending ? onClose() : null)}
      />
      <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-2xl bg-background shadow-2xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="space-y-0.5">
            <p className="text-xs text-muted-foreground">
              Алхам {step}/{STEPS_TOTAL}
            </p>
            <h2 className="text-lg font-semibold text-foreground">Шинэ зар</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => (!mutation.isPending ? onClose() : null)}
            aria-label="Хаах"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="max-h-[75vh] overflow-y-auto space-y-6 px-4 py-5">
          {submitError ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
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
              disabled={mutation.isPending}
            />
          )}
          {step === 3 && (
            <NewListingStepDetails
              register={register}
              errors={errors}
              disabled={mutation.isPending}
            />
          )}
          {step === 4 && (
            <NewListingStepImages
              files={files}
              fileInputRef={fileInputRef}
              onFilesChange={handleFilesChange}
              onRemoveFile={removeFile}
              onOpenPicker={openFilePicker}
              isPending={mutation.isPending}
            />
          )}
        </div>

        <div className="sticky bottom-0 left-0 right-0 border-t bg-background/95 px-4 py-3 backdrop-blur">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={step === 1 ? onClose : goBack}
              disabled={mutation.isPending}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Буцах
            </Button>
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className="rounded-full border-border/80 px-3 py-1 text-xs font-medium"
              >
                Алхам {step}/{STEPS_TOTAL}
              </Badge>
              <Button
                type={step === STEPS_TOTAL ? "submit" : "button"}
                onClick={goNext}
                disabled={mutation.isPending}
                className="min-w-35"
              >
                {mutation.isPending
                  ? "Илгээж байна..."
                  : step === STEPS_TOTAL
                    ? "Илгээх"
                    : "Дараах"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
