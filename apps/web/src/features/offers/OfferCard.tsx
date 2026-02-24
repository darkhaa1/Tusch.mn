"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@web/components/ui";
import type { Offer } from "@web/lib/api/types";
import resolveImageUrl from "@web/lib/resolveImageUrl";
import { cn } from "@web/lib/utils";

const statusStyles: Record<string, string> = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-700",
  ACCEPTED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  REJECTED: "border-rose-200 bg-rose-50 text-rose-700",
  EXPIRED: "border-slate-200 bg-slate-100 text-slate-600",
  CANCELLED: "border-slate-200 bg-slate-100 text-slate-600",
  COMPLETED: "border-sky-200 bg-sky-50 text-sky-700",
};

type OfferAction = "accept" | "reject" | "cancel";

type OfferCardProps = {
  offer: Offer;
  showListing?: boolean;
  showProvider?: boolean;
  onAccept?: (offer: Offer) => Promise<void>;
  onReject?: (offer: Offer) => Promise<void>;
  onCancel?: (offer: Offer) => Promise<void>;
  isBusy?: boolean;
};

export function OfferCard({
  offer,
  showListing = false,
  showProvider = false,
  onAccept,
  onReject,
  onCancel,
  isBusy = false,
}: OfferCardProps) {
  const t = useTranslations("offers");
  const [confirmAction, setConfirmAction] = useState<OfferAction | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const providerName = useMemo(() => {
    if (!offer.provider) return t("labels.unknownProvider");
    return (
      [offer.provider.firstName, offer.provider.lastName]
        .filter(Boolean)
        .join(" ")
        .trim() || t("labels.unknownProvider")
    );
  }, [offer.provider, t]);

  const listingLabel =
    offer.listing?.description?.trim() || t("labels.unknownListing");
  const listingMeta = [offer.listing?.category, offer.listing?.location]
    .filter(Boolean)
    .join(" · ");
  const offerPrice =
    typeof offer.price === "number"
      ? `${offer.price.toLocaleString()} ₮`
      : t("labels.priceOnRequest");
  const statusLabelMap = {
    PENDING: t("status.PENDING"),
    ACCEPTED: t("status.ACCEPTED"),
    REJECTED: t("status.REJECTED"),
    EXPIRED: t("status.EXPIRED"),
    CANCELLED: t("status.CANCELLED"),
    COMPLETED: t("status.COMPLETED"),
  } as const;
  const statusLabel = statusLabelMap[offer.status] || offer.status;
  const statusClass = statusStyles[offer.status] || statusStyles.PENDING;

  const canAccept = offer.status === "PENDING" && Boolean(onAccept);
  const canReject = offer.status === "PENDING" && Boolean(onReject);
  const canCancel = offer.status === "PENDING" && Boolean(onCancel);
  const hasActions = canAccept || canReject || canCancel;

  const actionConfig = useMemo(() => {
    if (!confirmAction) return null;
    switch (confirmAction) {
      case "accept":
        return {
          title: t("confirm.acceptTitle"),
          description: t("confirm.acceptDescription"),
          confirmLabel: t("actions.accept"),
          variant: "default" as const,
        };
      case "reject":
        return {
          title: t("confirm.rejectTitle"),
          description: t("confirm.rejectDescription"),
          confirmLabel: t("actions.reject"),
          variant: "destructive" as const,
        };
      case "cancel":
        return {
          title: t("confirm.cancelTitle"),
          description: t("confirm.cancelDescription"),
          confirmLabel: t("actions.cancel"),
          variant: "destructive" as const,
        };
      default:
        return null;
    }
  }, [confirmAction, t]);

  const handleConfirm = async () => {
    if (!confirmAction) return;
    setActionError(null);
    setIsSubmitting(true);
    try {
      if (confirmAction === "accept" && onAccept) {
        await onAccept(offer);
      } else if (confirmAction === "reject" && onReject) {
        await onReject(offer);
      } else if (confirmAction === "cancel" && onCancel) {
        await onCancel(offer);
      }
      setConfirmAction(null);
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : t("errors.generic")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border border-border/80">
      <CardContent className="space-y-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase text-muted-foreground">
              {t("labels.offer")}
            </p>
            <p className="text-2xl font-semibold text-foreground">
              {offerPrice}
            </p>
          </div>
          <Badge className={cn("border", statusClass)}>{statusLabel}</Badge>
        </div>

        {offer.message ? (
          <p className="text-sm text-muted-foreground">{offer.message}</p>
        ) : null}

        {offer.estimatedDays ? (
          <p className="text-xs text-muted-foreground">
            {t("labels.estimatedDays", { days: offer.estimatedDays })}
          </p>
        ) : null}

        {showProvider ? (
          <div className="flex items-center gap-3 rounded-lg border border-border/70 bg-muted/20 px-3 py-2">
            <Avatar
              src={resolveImageUrl(offer.provider?.avatarUrl) || undefined}
              alt={providerName}
              className="h-9 w-9"
            />
            <div>
              <p className="text-sm font-medium text-foreground">
                {providerName}
              </p>
              <p className="text-xs text-muted-foreground">
                {t("labels.provider")}
              </p>
            </div>
          </div>
        ) : null}

        {showListing && offer.listing ? (
          <Link
            href={`/listings/${offer.listingId}`}
            className="block rounded-lg border border-border/70 bg-muted/10 px-3 py-2 transition hover:border-primary/40"
          >
            <p className="text-sm font-medium text-foreground line-clamp-2">
              {listingLabel}
            </p>
            {listingMeta ? (
              <p className="text-xs text-muted-foreground">{listingMeta}</p>
            ) : null}
          </Link>
        ) : null}

        {hasActions ? (
          <div className="flex flex-wrap gap-2">
            {canAccept ? (
              <Button
                size="sm"
                onClick={() => setConfirmAction("accept")}
                disabled={isBusy}
              >
                {t("actions.accept")}
              </Button>
            ) : null}
            {canReject ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setConfirmAction("reject")}
                disabled={isBusy}
              >
                {t("actions.reject")}
              </Button>
            ) : null}
            {canCancel ? (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setConfirmAction("cancel")}
                disabled={isBusy}
              >
                {t("actions.cancel")}
              </Button>
            ) : null}
          </div>
        ) : null}
      </CardContent>

      <Dialog
        open={confirmAction !== null}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmAction(null);
            setActionError(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{actionConfig?.title}</DialogTitle>
            <DialogDescription>
              {actionConfig?.description}
            </DialogDescription>
          </DialogHeader>
          {actionError ? (
            <p className="text-sm text-destructive">{actionError}</p>
          ) : null}
          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <DialogClose asChild>
              <Button variant="outline" disabled={isSubmitting}>
                {t("actions.close")}
              </Button>
            </DialogClose>
            <Button
              variant={actionConfig?.variant}
              onClick={handleConfirm}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? t("actions.processing")
                : actionConfig?.confirmLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export default OfferCard;
