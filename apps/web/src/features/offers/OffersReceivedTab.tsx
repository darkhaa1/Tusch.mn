"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import type { Offer } from "@web/lib/api/types";
import { useAcceptOffer, useOffersReceived, useRejectOffer } from "@web/lib/hooks/useApi";
import { OffersList } from "./OffersList";

const DEFAULT_LIMIT = 8;

type ToastVariant = "success" | "error";

export function OffersReceivedTab() {
  const t = useTranslations("offers");
  const [page, setPage] = useState(1);
  const [busyOfferId, setBusyOfferId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastVariant, setToastVariant] = useState<ToastVariant>("success");

  const { data, isLoading, error, refetch } = useOffersReceived({
    page,
    limit: DEFAULT_LIMIT,
  });
  const acceptOffer = useAcceptOffer();
  const rejectOffer = useRejectOffer();

  useEffect(() => {
    if (!toastMessage) return;
    const timeout = setTimeout(() => setToastMessage(null), 3000);
    return () => clearTimeout(timeout);
  }, [toastMessage]);

  const handleAccept = async (offer: Offer) => {
    setBusyOfferId(offer.id);
    setToastVariant("success");
    try {
      await acceptOffer.mutateAsync({ offerId: offer.id });
      setToastMessage(t("toast.accepted"));
    } catch (err) {
      setToastVariant("error");
      setToastMessage(err instanceof Error ? err.message : t("errors.generic"));
    } finally {
      setBusyOfferId(null);
    }
  };

  const handleReject = async (offer: Offer) => {
    setBusyOfferId(offer.id);
    setToastVariant("success");
    try {
      await rejectOffer.mutateAsync({ offerId: offer.id });
      setToastMessage(t("toast.rejected"));
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
        showProvider
        onAccept={handleAccept}
        onReject={handleReject}
        busyOfferId={busyOfferId}
        emptyTitle={t("empty.receivedTitle")}
        emptyDescription={t("empty.receivedDescription")}
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

export default OffersReceivedTab;