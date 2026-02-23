"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Textarea,
} from "@web/components/ui";
import { useCreateOffer } from "@web/lib/hooks/useApi";

type CreateOfferModalProps = {
  listingId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateOfferModal({
  listingId,
  open,
  onOpenChange,
}: CreateOfferModalProps) {
  const t = useTranslations("offers");
  const createOffer = useCreateOffer();
  const [price, setPrice] = useState("");
  const [message, setMessage] = useState("");
  const [estimatedDays, setEstimatedDays] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!toastMessage) return;
    const timeout = setTimeout(() => setToastMessage(null), 3000);
    return () => clearTimeout(timeout);
  }, [toastMessage]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setError(null);
    }
    onOpenChange(nextOpen);
  };

  const handleSubmit = async () => {
    const numericPrice = Number(price);
    if (!price || Number.isNaN(numericPrice) || numericPrice <= 0) {
      setError(t("errors.priceRequired"));
      return;
    }

    if (!message.trim()) {
      setError(t("errors.messageRequired"));
      return;
    }

    let estimated: number | undefined;
    if (estimatedDays.trim()) {
      const numericDays = Number(estimatedDays);
      if (Number.isNaN(numericDays) || numericDays <= 0) {
        setError(t("errors.estimatedDays"));
        return;
      }
      estimated = numericDays;
    }

    setError(null);
    try {
      await createOffer.mutateAsync({
        listingId,
        data: {
          price: numericPrice,
          message: message.trim(),
          estimatedDays: estimated,
        },
      });
      setPrice("");
      setMessage("");
      setEstimatedDays("");
      onOpenChange(false);
      setToastMessage(t("toast.created"));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.generic"));
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("create.title")}</DialogTitle>
            <DialogDescription>{t("create.description")}</DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <label className="space-y-1 text-sm font-medium text-foreground">
              {t("labels.price")}
              <Input
                type="number"
                min={0}
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                placeholder={t("create.pricePlaceholder")}
              />
            </label>

            <label className="space-y-1 text-sm font-medium text-foreground">
              {t("labels.message")}
              <Textarea
                rows={4}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder={t("create.messagePlaceholder")}
              />
            </label>

            <label className="space-y-1 text-sm font-medium text-foreground">
              {t("labels.estimatedDaysLabel")}
              <Input
                type="number"
                min={1}
                value={estimatedDays}
                onChange={(event) => setEstimatedDays(event.target.value)}
                placeholder={t("create.estimatedPlaceholder")}
              />
            </label>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </div>

          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <DialogClose asChild>
              <Button variant="outline" disabled={createOffer.isPending}>
                {t("actions.close")}
              </Button>
            </DialogClose>
            <Button onClick={handleSubmit} disabled={createOffer.isPending}>
              {createOffer.isPending
                ? t("actions.processing")
                : t("actions.sendOffer")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

export default CreateOfferModal;
