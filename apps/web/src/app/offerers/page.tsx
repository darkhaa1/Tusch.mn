import type { Metadata } from "next";
import { Suspense } from "react";
import OfferersClient from "@web/features/offerers/OfferersClient";

export const metadata: Metadata = {
  title: "Үйлчилгээ үзүүлэгчид",
  description:
    "Найдвартай мэргэжилтнүүдийг олж, үнэлгээ харна уу.",
  alternates: {
    canonical: "https://tusch.mn/offerers",
  },
};

export default function OfferersPage() {
  return (
    <Suspense fallback={null}>
      <OfferersClient />
    </Suspense>
  );
}
