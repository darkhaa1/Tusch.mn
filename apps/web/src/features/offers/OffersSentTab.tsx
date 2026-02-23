"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import type { Offer } from "@web/lib/api/types";
import { useCancelOffer, useOffersSent } from "@web/lib/hooks/useApi";
import { OffersList } from "./OffersList";

const DEFAULT_LIMIT = 8;

type ToastVariant = "success" | "error";

export function OffersSentTab() {
  const t = useTranslations("offers");
  const [page, setPage] = useState(1);
  const [busyOfferId, setBusyOfferId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastVariant, setToastVariant] = useState<ToastVariant>("success");

  const { data, isLoading, error, refetch } = useOffersSent({
    page,
    limit: DEFAULT_LIMIT,
  });
  const cancelOffer = useCancelOffer();

  useEffect(() => {
    if (!toastMessage) return;
    const timeout = setTimeout(() => setToastMessage(null), 3000);
    return () => clearTimeout(timeout);
  }, [toastMessage]);

  const handleCancel = async (offer: Offer) => {
    setBusyOfferId(offer.id);
    setToastVariant("success");
    try {
      await cancelOffer.mutateAsync({ offerId: offer.id });
      setToastMessage(t("toast.cancelled"));
    } catch (err) {
      setToastVariant("error");
      setToastMessage(err instanceof Error ? err.message : t("errors.generic"));
    } finally {
      setBusyOfferId(null);
    }
  };

  return (
    <>
      <OffersList
        items={data?.items ?? []}
        isLoading={isLoading}
        error={error}
        page={data?.page ?? page}
        total={data?.total ?? 0}
        limit={data?.limit ?? DEFAULT_LIMIT}
        onPageChange={setPage}
        onRetry={() => refetch()}
        showListing
        onCancel={handleCancel}
        busyOfferId={busyOfferId}
        emptyTitle={t("empty.sentTitle")}
        emptyDescription={t("empty.sentDescription")}
      />

      {toastMessage ? (
        <div
          role="status"
          className={`fixed right-4 top-4 z-50 rounded-lg border px-4 py-2 text-sm shadow ${
            toastVariant === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-700"
          }`}
        >
          {toastMessage}
        </div>
      ) : null}
    </>
  );
}

export default OffersSentTab;