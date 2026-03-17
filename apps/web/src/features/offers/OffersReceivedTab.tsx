"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import type { Offer } from "@web/lib/api/types";
import { useAcceptOffer, useCompleteOffer, useOffersReceived, useRejectOffer } from "@web/lib/hooks/useApi";
import { OffersList } from "./OffersList";
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@web/components/ui";

const DEFAULT_LIMIT = 8;

type ToastVariant = "success" | "error";

export function OffersReceivedTab() {
  const t = useTranslations("offers");
  const [page, setPage] = useState(1);
  const [busyOfferId, setBusyOfferId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastVariant, setToastVariant] = useState<ToastVariant>("success");
  const [completeTarget, setCompleteTarget] = useState<Offer | null>(null);
  const [clientNote, setClientNote] = useState("");

  const { data, isLoading, error, refetch } = useOffersReceived({
    page,
    limit: DEFAULT_LIMIT,
  });
  const acceptOffer = useAcceptOffer();
  const rejectOffer = useRejectOffer();
  const completeOffer = useCompleteOffer();

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

  const handleConfirmComplete = async () => {
    if (!completeTarget) return;
    try {
      await completeOffer.mutateAsync({
        offerId: completeTarget.id,
        clientNote: clientNote.trim() || undefined,
      });
      setToastVariant("success");
      setToastMessage(t("history.toast.completed"));
    } catch (err) {
      setToastVariant("error");
      setToastMessage(err instanceof Error ? err.message : t("errors.generic"));
    } finally {
      setCompleteTarget(null);
      setClientNote("");
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
        onComplete={setCompleteTarget}
        busyOfferId={busyOfferId}
        emptyTitle={t("empty.receivedTitle")}
        emptyDescription={t("empty.receivedDescription")}
      />

      <Dialog
        open={completeTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setCompleteTarget(null);
            setClientNote("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("history.complete.title")}</DialogTitle>
            <DialogDescription>{t("history.complete.description")}</DialogDescription>
          </DialogHeader>
          <textarea
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            rows={3}
            placeholder={t("history.complete.notePlaceholder")}
            value={clientNote}
            onChange={(e) => setClientNote(e.target.value)}
          />
          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <DialogClose asChild>
              <Button variant="outline" disabled={completeOffer.isPending}>
                {t("actions.close")}
              </Button>
            </DialogClose>
            <Button onClick={handleConfirmComplete} disabled={completeOffer.isPending}>
              {completeOffer.isPending ? t("actions.processing") : t("history.complete.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
