"use client";

import React from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateListing } from "../hooks/useApi";

const categories = [
  { value: "network_repair", label: "Шугам сүлжээ засвар угсралт" },
  { value: "moving", label: "Нүүлгэлт" },
  { value: "home_cleaning", label: "Гэр цэвэрлэгээ" },
  { value: "dog_walking", label: "Нохой салхилуулах" },
  { value: "carpentry", label: "Мужаан, тавилга угсралт" },
  { value: "auto_repair", label: "Авто засвар" },
  { value: "babysitting", label: "Хүүхэд асрагч" },
  { value: "tutoring", label: "Гэрийн багш" },
];

const ListingSchema = z.object({
  title: z.string().min(3, "Minimum 3 caractères"),
  category: z.string().min(1, "Категори сонгоно уу"),
  description: z.string().min(10, "Minimum 10 caractères"),
  price: z.number().int().nonnegative("Doit être ≥ 0"),
  location: z.string().optional(),
});

type ListingForm = z.infer<typeof ListingSchema>;

type NewListingModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function NewListingModal({ isOpen, onClose }: NewListingModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ListingForm>({
    resolver: zodResolver(ListingSchema),
    defaultValues: {
      title: "",
      category: "",
      description: "",
      price: 0,
      location: "",
    },
  });

  const mutation = useCreateListing();

  const onSubmit = (data: ListingForm) => mutation.mutate(data, {
    onSuccess: () => {
      reset();
      onClose();
    },
  });

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => (!mutation.isPending ? onClose() : null)}
      />
      <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-neutral-100">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Шинэ зар нэмэх</h2>
          <button
            onClick={() => (!mutation.isPending ? onClose() : null)}
            className="rounded p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block">Гарчиг</label>
            <input
              className="w-full rounded border p-2"
              {...register("title")}
              placeholder="Жишээ нь: Хүүхэд асрагч"
              disabled={mutation.isPending}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block">Категори</label>
            <select
              className="w-full rounded border p-2"
              {...register("category")}
              disabled={mutation.isPending}
            >
              <option value="">Сонгох</option>
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-sm text-red-500">{errors.category.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block">Дэлгэрэнгүй</label>
            <textarea
              rows={4}
              className="w-full rounded border p-2"
              {...register("description")}
              placeholder="Дэлгэрэнгүй мэдээлэл оруулна уу"
              disabled={mutation.isPending}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block">Үнэ</label>
            <input
              type="number"
              className="w-full rounded border p-2"
              {...register("price", { valueAsNumber: true })}
              placeholder="0"
              disabled={mutation.isPending}
            />
            {errors.price && (
              <p className="text-sm text-red-500">{errors.price.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block">Байршил (сонголттой)</label>
            <input
              className="w-full rounded border p-2"
              {...register("location")}
              placeholder="Улаанбаатар, Дархан…"
              disabled={mutation.isPending}
            />
            {errors.location && (
              <p className="text-sm text-red-500">{errors.location.message}</p>
            )}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => (!mutation.isPending ? onClose() : null)}
              className="rounded border px-4 py-2"
              disabled={mutation.isPending}
            >
              Цуцлах
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
            >
              {mutation.isPending ? "Илгээж байна…" : "Үүсгэх"}
            </button>
          </div>

          {mutation.isError && (
            <p className="pt-2 text-sm text-red-600">
              {(mutation.error as Error)?.message || "Erreur lors de l’envoi"}
            </p>
          )}
        </form>
      </div>
    </div>,
    document.body
  );
}
