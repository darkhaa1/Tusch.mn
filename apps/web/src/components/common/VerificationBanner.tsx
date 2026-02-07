"use client";

import { useEffect, useState } from "react";
import { Button } from "@web/components/ui";
import { useCurrentUser, useResendVerification } from "@web/lib/hooks/useApi";

export default function VerificationBanner() {
  const { data: currentUser } = useCurrentUser();
  const { mutateAsync, isPending } = useResendVerification();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const shouldShow =
    Boolean(currentUser) && currentUser?.emailVerified === false;

  useEffect(() => {
    if (!toastMessage) return;
    const timeout = setTimeout(() => setToastMessage(null), 3000);
    return () => clearTimeout(timeout);
  }, [toastMessage]);

  if (!shouldShow) return null;

  const handleResend = async () => {
    setErrorMessage(null);
    try {
      const response = await mutateAsync();
      setToastMessage(
        response?.message || "Баталгаажуулах холбоос дахин илгээгдлээ"
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Алдаа гарлаа"
      );
    }
  };

  return (
    <>
      <div className="mb-4 w-full rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm">
            Имэйл хаягаа баталгаажуулна уу. Зар нийтлэх болон мессеж
            бичихийн тулд имэйлээ баталгаажуулах шаардлагатай.
          </p>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={handleResend}
            disabled={isPending}
          >
            Дахин илгээх
          </Button>
        </div>
        {errorMessage ? (
          <p className="mt-2 text-xs text-red-600">{errorMessage}</p>
        ) : null}
      </div>

      {toastMessage ? (
        <div
          role="status"
          className="fixed right-4 top-4 z-50 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800 shadow"
        >
          {toastMessage}
        </div>
      ) : null}
    </>
  );
}
