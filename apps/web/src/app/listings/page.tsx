import type { Metadata } from "next";
import { Suspense } from "react";
import ListingsClient from "@web/features/listings/ListingsClient";

export const metadata: Metadata = {
  title: "Зарууд",
  description:
    "Бүх төрлийн үйлчилгээний зарууд. Сантехник, барилга, цэвэрлэгээ, зөөвөрлөлт.",
  alternates: {
    canonical: "https://tusch.mn/listings",
  },
};

export default function ListingsPage() {
  return (
    <Suspense fallback={null}>
      <ListingsClient />
    </Suspense>
  );
}
