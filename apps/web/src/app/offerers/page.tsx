import { Suspense } from "react";
import OfferersClient from "@web/features/offerers/OfferersClient";

export default function OfferersPage() {
  return (
    <Suspense fallback={null}>
      <OfferersClient />
    </Suspense>
  );
}
