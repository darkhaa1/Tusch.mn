import { Suspense } from "react";
import ListingsClient from "@web/features/listings/ListingsClient";

export default function ListingsPage() {
  return (
    <Suspense fallback={null}>
      <ListingsClient />
    </Suspense>
  );
}
