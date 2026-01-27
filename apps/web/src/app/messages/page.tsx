import { Suspense } from "react";
import MessagesClient from "@web/features/messages/MessagesClient";

export default function MessagesPage() {
  return (
    <Suspense fallback={null}>
      <MessagesClient />
    </Suspense>
  );
}
