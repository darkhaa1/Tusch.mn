"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Star } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Button,
  Card,
  CardContent,
  Skeleton,
  Textarea,
} from "@web/components/ui";
import AppShell from "@web/components/layout/AppShell";
import {
  useCheckReview,
  useCreateReview,
  useCurrentUser,
  useOffer,
} from "@web/lib/hooks/useApi";
import { cn } from "@web/lib/utils";

function ReviewCreateContent() {
  const t = useTranslations("reviews.create");
  const router = useRouter();
  const searchParams = useSearchParams();
  const offerId = searchParams.get("offerId") ?? undefined;

  const { data: currentUser, isLoading: userLoading } = useCurrentUser();
  const { data: offer, isLoading: offerLoading, error: offerError } = useOffer(offerId);
  const { data: checkData, isLoading: checkLoading } = useCheckReview(offerId);
  const createReview = useCreateReview();

  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Determine the target user (the other party)
  const targetUserId =
    offer && currentUser
      ? currentUser.id === offer.listing?.userId
        ? offer.providerId
        : offer.listing?.userId
      : undefined;

  const isLoading = userLoading || offerLoading || checkLoading;

  useEffect(() => {
    if (!userLoading && !currentUser) {
      router.push("/");
    }
  }, [userLoading, currentUser, router]);

  const handleSubmit = async () => {
    setError("");
    if (rating === 0) {
      setError(t("ratingLabel"));
      return;
    }
    if (comment.trim().length < 20) {
      setError(t("commentMinError"));
      return;
    }
    if (!offerId) return;

    try {
      await createReview.mutateAsync({ offerId, rating, comment: comment.trim() });
      setSuccess(true);
      setTimeout(() => {
        router.push(targetUserId ? `/u/${targetUserId}` : "/");
      }, 2000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      setError(msg || t("commentMinError"));
    }
  };

  if (isLoading) {
    return (
      <AppShell title={t("title")} description={t("description")}>
        <div className="space-y-4 max-w-xl mx-auto">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </AppShell>
    );
  }

  if (!currentUser) return null;

  if (!offerId || offerError) {
    return (
      <AppShell title={t("title")} description={t("description")}>
        <Card className="max-w-xl mx-auto">
          <CardContent className="p-6 text-sm text-destructive">{t("offerNotFound")}</CardContent>
        </Card>
      </AppShell>
    );
  }

  if (checkData?.reviewed) {
    return (
      <AppShell title={t("title")} description={t("description")}>
        <Card className="max-w-xl mx-auto">
          <CardContent className="p-6 text-sm text-muted-foreground">{t("alreadyReviewed")}</CardContent>
        </Card>
      </AppShell>
    );
  }

  const listingDescription = offer?.listing?.description ?? "—";
  const otherPartyId = targetUserId;

  return (
    <AppShell
      title={t("title")}
      description={t("description")}
      actions={
        <Button variant="secondary" onClick={() => router.back()}>
          {t("back")}
        </Button>
      }
    >
      <div className="max-w-xl mx-auto space-y-4">
        {/* Offer context */}
        <Card className="border border-border/80">
          <CardContent className="p-5 space-y-2">
            <p className="text-xs uppercase text-muted-foreground font-medium">{t("context")}</p>
            <p className="text-sm text-foreground">
              <span className="font-medium">{t("listing")} :</span>{" "}
              {listingDescription}
            </p>
            {otherPartyId && (
              <p className="text-sm text-foreground">
                <span className="font-medium">{t("otherParty")} :</span>{" "}
                <Link href={`/u/${otherPartyId}`} className="text-primary hover:underline">
                  {offer?.provider?.firstName && offer.provider.firstName}{" "}
                  {offer?.provider?.lastName && offer.provider.lastName}
                </Link>
              </p>
            )}
          </CardContent>
        </Card>

        {/* Review form */}
        <Card className="border border-border/80">
          <CardContent className="p-6 space-y-5">
            {/* Star rating */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">{t("ratingLabel")}</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={cn(
                        "h-9 w-9 cursor-pointer transition-colors",
                        star <= (hovered || rating)
                          ? "fill-amber-400 stroke-amber-400"
                          : "stroke-muted-foreground hover:stroke-amber-300"
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">{t("commentLabel")}</p>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t("commentPlaceholder")}
                maxLength={2000}
                rows={5}
                className={cn(
                  comment.trim().length > 0 && comment.trim().length < 20
                    ? "border-destructive"
                    : ""
                )}
              />
              <p className="text-xs text-muted-foreground text-right">
                {comment.trim().length}/2000
                {comment.trim().length > 0 && comment.trim().length < 20 && (
                  <span className="text-destructive ml-2">{t("commentMinError")}</span>
                )}
              </p>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
            {success && <p className="text-sm text-green-600">{t("success")}</p>}

            <Button
              onClick={handleSubmit}
              disabled={createReview.isPending || success || rating === 0 || comment.trim().length < 20}
              className="w-full"
            >
              {createReview.isPending ? t("submitting") : t("submit")}
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

export default function ReviewCreatePage() {
  return (
    <Suspense>
      <ReviewCreateContent />
    </Suspense>
  );
}
