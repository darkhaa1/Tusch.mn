"use client";

import React from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateListing } from "../hooks/useApi";
import { uploadListingImages } from "../lib/api";
import type { Listing } from "../lib/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import { cn } from "../lib/utils";
import {
  Wrench,
  Home,
  Truck,
  PawPrint,
  Car,
  Baby,
  BookOpen,
  Sparkles,
  X,
  ArrowLeft,
  ImageUp,
} from "lucide-react";

const categories = [
  { value: "network_repair", label: "Сүлжээ / интернет", icon: Wrench },
  { value: "moving", label: "Нүүлгэлт", icon: Truck },
  { value: "home_cleaning", label: "Цэвэрлэгээ", icon: Home },
  { value: "dog_walking", label: "Нохой салхилуулах", icon: PawPrint },
  { value: "carpentry", label: "Модон ажил", icon: Sparkles },
  { value: "auto_repair", label: "Авто засвар", icon: Car },
  { value: "babysitting", label: "Хүүхэд асрах", icon: Baby },
  { value: "tutoring", label: "Хичээл заах", icon: BookOpen },
];

const ListingSchema = z.object({
  category: z.string().min(1, "Ангилал сонгоно уу"),
  description: z.string().min(10, "Тайлбар дор хаяж 10 тэмдэгт байх ёстой"),
  price: z.number().int().nonnegative("Үнэ 0-ээс их эсвэл тэнцүү байх ёстой"),
  location: z.string().optional(),
});

type ListingForm = z.infer<typeof ListingSchema>;

type NewListingModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const stepsTotal = 4;

export default function NewListingModal({ isOpen, onClose }: NewListingModalProps) {
  const [files, setFiles] = React.useState<File[]>([]);
  const [step, setStep] = React.useState(1);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    watch,
    formState: { errors },
    reset,
  } = useForm<ListingForm>({
    resolver: zodResolver(ListingSchema),
    defaultValues: {
      category: "",
      description: "",
      price: 0,
      location: "",
    },
  });

  const mutation = useCreateListing();
  const categoryValue = watch("category");
  const priceValue = watch("price");

  const onSubmit = async (data: ListingForm) => {
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
      console.error(err);
    }
  };

  const handleFilesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files || []);
    if (selected.length === 0) return;
    const next = [...files, ...selected].slice(0, 3);
    setFiles(next);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const openFilePicker = () => {
    if (mutation.isPending) return;
    fileInputRef.current?.click();
  };

  const goNext = async () => {
    if (step === 1) {
      const valid = await trigger("category");
      if (!valid) return;
    }
    if (step === 2) {
      const valid = await trigger("price");
      if (!valid) return;
    }
    if (step === 3) {
      const valid = await trigger(["description", "location"]);
      if (!valid) return;
    }
    if (step < stepsTotal) {
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
            <p className="text-xs text-muted-foreground">Алхам {step}/{stepsTotal}</p>
            <h2 className="text-lg font-semibold text-foreground">Зар нэмэх</h2>
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

        <div className="max-h-[75vh] overflow-y-auto px-4 py-5 space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">Ангилал</p>
                <p className="text-xs text-muted-foreground">Таны хэрэгцээнд хамгийн ойр ангиллыг сонгоно уу.</p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {categories.map((category) => {
                  const Icon = category.icon;
                  const active = categoryValue === category.value;
                  return (
                    <button
                      key={category.value}
                      type="button"
                      onClick={() => setValue("category", category.value, { shouldValidate: true })}
                      className={cn(
                        "flex h-20 flex-col items-start justify-between rounded-xl border p-3 text-left transition",
                        active
                          ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                          : "border-border hover:border-primary/40"
                      )}
                    >
                      <Icon className={cn("h-5 w-5", active ? "text-primary" : "text-muted-foreground")} />
                      <span className="text-sm font-medium text-foreground">{category.label}</span>
                    </button>
                  );
                })}
              </div>
              {errors.category ? (
                <p className="text-sm text-destructive">{errors.category.message}</p>
              ) : (
                <p className="text-xs text-muted-foreground">Сонгосон: {categoryValue || "сонгоогүй"}</p>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">Төсөв / үнэ</p>
                <p className="text-xs text-muted-foreground">Тохиролцох боломжтой бол 0 гэж үлдээнэ үү.</p>
              </div>
              <Input
                type="number"
                inputMode="numeric"
                min={0}
                className="h-12 text-base"
                placeholder="Үнэ (₮)"
                {...register("price", { valueAsNumber: true })}
                disabled={mutation.isPending}
              />
              <div className="flex flex-wrap gap-2">
                {[0, 20000, 50000, 100000].map((preset) => (
                  <Button
                    key={preset}
                    type="button"
                    variant={priceValue === preset ? "default" : "outline"}
                    size="sm"
                    onClick={() => setValue("price", preset, { shouldValidate: true })}
                  >
                    {preset === 0 ? "Тохиролцоно" : `${preset.toLocaleString()} ₮`}
                  </Button>
                ))}
              </div>
              {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">Тайлбар</p>
                <p className="text-xs text-muted-foreground">Ажил гүйцэтгэхэд хэрэгтэй мэдээллээ товч тодорхой бичээрэй.</p>
              </div>
              <Textarea
                rows={5}
                className="text-base"
                placeholder="Жишээ: 2 өрөө байр цэвэрлүүлэх, цагийг тохирно..."
                {...register("description")}
                disabled={mutation.isPending}
              />
              {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}

              <div className="space-y-1 pt-2">
                <p className="text-sm font-medium text-foreground">Байршил</p>
                <Input
                  className="h-12 text-base"
                  placeholder="Хот, дүүрэг..."
                  {...register("location")}
                  disabled={mutation.isPending}
                />
                {errors.location && <p className="text-sm text-destructive">{errors.location.message}</p>}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">Зураг нэмэх</p>
                <p className="text-xs text-muted-foreground">Итгэл төрүүлэхийн тулд 3 хүртэл зураг нэмээрэй.</p>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Дээд тал нь 3 зураг</span>
                <span className="font-medium text-foreground">{files.length}/3</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[0, 1, 2].map((idx) => {
                  const file = files[idx];
                  if (file) {
                    return (
                      <div
                        key={`${file.name}-${idx}`}
                        className="relative aspect-square overflow-hidden rounded-xl border"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={URL.createObjectURL(file)} alt={file.name} className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeFile(idx)}
                          className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-[10px] text-white"
                          disabled={mutation.isPending}
                        >
                          Устгах
                        </button>
                      </div>
                    );
                  }
                  return (
                    <button
                      key={`empty-${idx}`}
                      type="button"
                      onClick={openFilePicker}
                      className="flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/40 text-xs text-muted-foreground transition hover:border-primary hover:text-primary"
                      disabled={mutation.isPending}
                    >
                      <ImageUp className="h-5 w-5" aria-hidden="true" />
                      <span>Зураг нэмэх</span>
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
                onChange={handleFilesChange}
                disabled={mutation.isPending}
              />
            </div>
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
              <Badge variant="outline" className="rounded-full border-border/80 px-3 py-1 text-xs font-medium">
                Алхам {step}/{stepsTotal}
              </Badge>
              <Button
                type={step === stepsTotal ? "submit" : "button"}
                onClick={goNext}
                disabled={mutation.isPending}
                className="min-w-[140px]"
              >
                {mutation.isPending ? "Илгээж байна..." : step === stepsTotal ? "Илгээх" : "Дараагийн"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
