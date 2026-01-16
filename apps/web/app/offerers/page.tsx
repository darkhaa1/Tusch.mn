import { Suspense } from "react";
import OfferersClient from "./OfferersClient";

export default function OfferersPage() {
  return (
    <Suspense fallback={null}>
      <OfferersClient />
    </Suspense>
  );
}
