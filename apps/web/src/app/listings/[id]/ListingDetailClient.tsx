"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { EllipsisVertical } from "lucide-react";
import {
  useCurrentUser,
  useDeleteListing,
  useListing,
  useOffersByListing,
  useAcceptOffer,
  useRejectOffer,
  useReorderListingImages,
  useSendMessage,
  useUpdateListing,
} from "@web/lib/hooks/useApi";
import { deleteListingImage, uploadListingImages } from "@web/lib/api/listings";
import type { Listing, Offer } from "@web/lib/api/types";
import resolveImageUrl from "@web/lib/resolveImageUrl";
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
} from "@web/components/ui";
import { ListingGallery } from "@web/features/listings/components/ListingGallery";
import { ListingDetailsCard } from "@web/features/listings/components/ListingDetailsCard";
import { ListingSidebar } from "@web/features/listings/components/ListingSidebar";
import { CATEGORY_OPTIONS, CATEGORY_LABEL_MAP } from "@web/lib/categories";
import { ReportDialogButton } from "@web/components/report/ReportDialogButton";
import { CreateOfferModal } from "@web/features/offers/CreateOfferModal";
import { OffersList } from "@web/features/offers/OffersList";

export default function ListingDetailClient() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations("offers");
  const tl = useTranslations("listings");
  const listingId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const { data: listing, isLoading, error, refetch } = useListing(listingId);
  const { data: currentUser } = useCurrentUser();
  const acceptOffer = useAcceptOffer();
  const rejectOffer = useRejectOffer();
  const updateListing = useUpdateListing();
  const deleteListing = useDeleteListing();
  const reorderListingImages = useReorderListingImages();
  const sendMessage = useSendMessage();

  const [isEditing, setIsEditing] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [messageContent, setMessageContent] = useState("");
  const [messageFeedback, setMessageFeedback] = useState<string | null>(null);
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [offerToast, setOfferToast] = useState<string | null>(null);
  const [offerToastVariant, setOfferToastVariant] = useState<"success" | "error">("success");
  const [busyOfferId, setBusyOfferId] = useState<string | null>(null);
  const [formState, setFormState] = useState({
    description: "",
    price: "",
    location: "",
    category: "",
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [images, setImages] = useState<NonNullable<Listing["images"]>>([]);

  const isOwner = useMemo(() => {
    if (!listing || !currentUser) return false;
    return listing.userId === currentUser.id;
  }, [listing, currentUser]);
  const canReport = Boolean(currentUser) && !isOwner && Boolean(listingId);
  const canMakeOffer = Boolean(currentUser) &&
    !isOwner &&
    ["PROVIDER", "BOTH"].includes(String(currentUser?.role || ""));

  const { data: offersByListing, isLoading: offersLoading, error: offersError, refetch: refetchOffers } =
    useOffersByListing(listingId as string, isOwner);

  useEffect(() => {
    if (!listing) return;
    setFormState({
      description: listing.description || "",
      price: listing.price?.toString() || "",
      location: listing.location || "",
      category: listing.category || "",
    });
    setImages(listing.images || []);
    setSelectedIndex(0);
  }, [listing]);

  useEffect(() => {
    if (!offerToast) return;
    const timeout = setTimeout(() => setOfferToast(null), 3000);
    return () => clearTimeout(timeout);
  }, [offerToast]);

  const handleSave = async () => {
    if (!listingId) return;
    if (!formState.description.trim()) {
      setFormError(tl("detail.errors.emptyDescription"));
      return;
    }
    const priceNumber = Number(formState.price);
    if (Number.isNaN(priceNumber) || priceNumber < 0) {
      setFormError(tl("detail.errors.invalidPrice"));
      return;
    }
    setFormError(null);
    try {
      await updateListing.mutateAsync({
        id: listingId,
        data: {
          description: formState.description.trim(),
          price: priceNumber,
          location: formState.location.trim() || undefined,
          category: formState.category || undefined,
        },
      });
      setIsEditing(false);
      await refetch();
    } catch (err: unknown) {
      const message = err instanceof Error ? (err as Error & { message: string }).message : "";
      setFormError(message || tl("detail.errors.saveError"));
    }
  };

  const handleCancelEdit = () => {
    if (listing) {
      setFormState({
        description: listing.description || "",
        price: listing.price?.toString() || "",
        location: listing.location || "",
        category: listing.category || "",
      });
    }
    setIsEditing(false);
    setFormError(null);
  };

  const handleDeleteConfirmed = async () => {
    if (!listingId) return;
    setFormError(null);
    try {
      await deleteListing.mutateAsync(listingId);
      router.push("/");
    } catch (err: unknown) {
      const message = err instanceof Error ? (err as Error & { message: string }).message : "";
      setFormError(message || tl("detail.errors.deleteError"));
    } finally {
      setConfirmDeleteOpen(false);
    }
  };

  const handleImagesUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!listingId) return;
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    const currentCount = listing?.images?.length || 0;
    const remaining = Math.max(0, 3 - currentCount);
    const toUpload = files.slice(0, remaining);
    if (!toUpload.length) return;
    setIsUploadingImages(true);
    try {
      await uploadListingImages(listingId, toUpload);
      await refetch();
    } catch (err: unknown) {
      const message = err instanceof Error ? (err as Error & { message: string }).message : "";
      setFormError(message || tl("detail.errors.imageUpload"));
    } finally {
      setIsUploadingImages(false);
      event.target.value = "";
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!listingId) return;
    setDeletingImageId(imageId);
    try {
      await deleteListingImage(listingId, imageId);
      await refetch();
    } catch (err: unknown) {
      const message = err instanceof Error ? (err as Error & { message: string }).message : "";
      setFormError(message || tl("detail.errors.imageDelete"));
    } finally {
      setDeletingImageId(null);
    }
  };

  const handleReorderImages = async (nextImageIds: string[]) => {
    if (!listingId || images.length === 0) return;

    const previousImages = images;
    const selectedImageId = previousImages[selectedIndex]?.id;
    const reorderedImages = nextImageIds
      .map((id) => previousImages.find((image) => image.id === id))
      .filter((image): image is NonNullable<Listing["images"]>[number] => Boolean(image));

    if (reorderedImages.length !== previousImages.length) {
      setFormError(tl("detail.errors.imageOrder"));
      return;
    }

    setFormError(null);
    setImages(reorderedImages);

    if (selectedImageId) {
      const newSelectedIndex = reorderedImages.findIndex((image) => image.id === selectedImageId);
      if (newSelectedIndex >= 0) {
        setSelectedIndex(newSelectedIndex);
      }
    }

    try {
      await reorderListingImages.mutateAsync({
        listingId,
        imageIds: nextImageIds,
      });
    } catch (err: unknown) {
      setImages(previousImages);
      if (selectedImageId) {
        const previousIndex = previousImages.findIndex((image) => image.id === selectedImageId);
        if (previousIndex >= 0) {
          setSelectedIndex(previousIndex);
        }
      }
      const message = err instanceof Error ? (err as Error & { message: string }).message : "";
      setFormError(message || tl("detail.errors.imageReorder"));
    }
  };

  const handleSendMessage = async () => {
    if (!listing || !listingId || !listing.userId) return;
    if (!currentUser) {
      setMessageFeedback(tl("detail.errors.messageLogin"));
      return;
    }
    const content = messageContent.trim();
    if (!content) {
      setMessageFeedback(tl("detail.errors.messageEmpty"));
      return;
    }
    setMessageFeedback(null);
    try {
      await sendMessage.mutateAsync({
        recipientId: listing.userId,
        listingId,
        content,
      });
      setMessageContent("");
      setMessageDialogOpen(false);
      setMessageFeedback(tl("detail.errors.messageSent"));
    } catch (err: unknown) {
      const message = err instanceof Error ? (err as Error & { message: string }).message : "";
      setMessageFeedback(message || tl("detail.errors.messageError"));
    }
  };

  const handleAcceptOffer = async (offer: Offer) => {
    setBusyOfferId(offer.id);
    setOfferToastVariant("success");
    try {
      await acceptOffer.mutateAsync({ offerId: offer.id });
      setOfferToast(t("toast.accepted"));
      await refetchOffers();
    } catch (err) {
      setOfferToastVariant("error");
      setOfferToast(err instanceof Error ? err.message : t("errors.generic"));
    } finally {
      setBusyOfferId(null);
    }
  };

  const handleRejectOffer = async (offer: Offer) => {
    setBusyOfferId(offer.id);
    setOfferToastVariant("success");
    try {
      await rejectOffer.mutateAsync({ offerId: offer.id });
      setOfferToast(t("toast.rejected"));
      await refetchOffers();
    } catch (err) {
      setOfferToastVariant("error");
      setOfferToast(err instanceof Error ? err.message : t("errors.generic"));
    } finally {
      setBusyOfferId(null);
    }
  };

  if (isLoading) return <p className="py-10 text-center text-muted-foreground">{tl("detail.loading")}</p>;
  if (error) return <p className="py-10 text-center text-destructive">{tl("detail.error")}</p>;
  if (!listing) return <p className="py-10 text-center text-muted-foreground">{tl("detail.notFound")}</p>;

  const author = listing.user;
  const authorName = author
    ? `${author.firstName || ""} ${author.lastName || ""}`.trim() || author.email
    : tl("detail.unknownUser");
  const authorAvatar = resolveImageUrl(author?.avatarUrl);
  const imageUrls = images.map((img) => resolveImageUrl(img.url) || "/placeholder.jpg");
  const displayedMain = imageUrls[selectedIndex] || resolveImageUrl(images[0]?.url) || "/placeholder.jpg";
  const categoryValue = isEditing ? formState.category : listing.category;
  const categoryLabel = categoryValue ? CATEGORY_LABEL_MAP.get(categoryValue) || categoryValue : null;
  const heading = categoryLabel || tl("detail.listingFallback");
  const priceLabel =
    typeof listing.price === "number" && listing.price > 0
      ? `${listing.price.toLocaleString()} ₮`
      : tl("detail.priceOnRequest");
  const contactHref = author?.phone ? `tel:${author.phone}` : author?.email ? `mailto:${author.email}` : null;
  const locationLabel = listing.location || tl("detail.noLocation");

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-16 pt-6">
      <div className="mb-4 flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          {tl("detail.back")}
        </Button>
        <div className="flex items-center gap-2">
          {canReport ? (
            <ReportDialogButton
              targetType="LISTING"
              targetId={listingId as string}
              variant="outline"
              size="sm"
            />
          ) : null}
          {isOwner ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="rounded-full border border-border bg-background p-2 hover:bg-muted">
                <EllipsisVertical className="h-5 w-5" aria-hidden="true" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="min-w-45">
                {!isEditing ? (
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>{tl("detail.edit")}</DropdownMenuItem>
                ) : null}
                <DropdownMenuItem onClick={() => setConfirmDeleteOpen(true)} className="text-destructive">
                  {tl("detail.delete")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/listings")}>{tl("detail.allListings")}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-4 md:col-span-2">
          <ListingGallery
            heading={heading}
            categoryLabel={categoryLabel}
            imageUrls={imageUrls}
            displayedMain={displayedMain}
            selectedIndex={selectedIndex}
            onSelect={setSelectedIndex}
          />

          {isOwner ? (
            <Tabs defaultValue="details" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger
                  value="details"
                  className="w-full transition hover:bg-muted data-[state=active]:border-b-2 data-[state=active]:border-primary"
                >
                  {t("listing.detailsTab")}
                </TabsTrigger>
                <TabsTrigger
                  value="offers"
                  className="w-full transition hover:bg-muted data-[state=active]:border-b-2 data-[state=active]:border-primary"
                >
                  {t("listing.offersTab")}
                </TabsTrigger>
              </TabsList>
              <TabsContent value="details">
                <ListingDetailsCard
                  heading={heading}
                  categoryLabel={categoryLabel}
                  listingDescription={listing.description}
                  isEditing={isEditing}
                  formState={formState}
                  onFieldChange={(field, value) =>
                    setFormState((prev) => ({ ...prev, [field]: value }))
                  }
                  onSave={handleSave}
                  onCancel={handleCancelEdit}
                  isSaving={updateListing.isPending}
                  categories={CATEGORY_OPTIONS}
                  formError={formError}
                />
              </TabsContent>
              <TabsContent value="offers">
                <OffersList
                  items={offersByListing ?? []}
                  isLoading={offersLoading}
                  error={offersError}
                  onRetry={() => refetchOffers()}
                  showProvider
                  onAccept={handleAcceptOffer}
                  onReject={handleRejectOffer}
                  busyOfferId={busyOfferId}
                  emptyTitle={t("listing.emptyTitle")}
                  emptyDescription={t("listing.emptyDescription")}
                />
              </TabsContent>
            </Tabs>
          ) : (
            <ListingDetailsCard
              heading={heading}
              categoryLabel={categoryLabel}
              listingDescription={listing.description}
              isEditing={isEditing}
              formState={formState}
              onFieldChange={(field, value) =>
                setFormState((prev) => ({ ...prev, [field]: value }))
              }
              onSave={handleSave}
              onCancel={handleCancelEdit}
              isSaving={updateListing.isPending}
              categories={CATEGORY_OPTIONS}
              formError={formError}
            />
          )}
        </div>

        <ListingSidebar
          priceLabel={priceLabel}
          locationLabel={locationLabel}
          categoryLabel={categoryLabel}
          authorName={authorName || tl("detail.unknownUser")}
          authorEmail={author?.email}
          authorPhone={author?.phone}
          authorAvatar={authorAvatar}
          profileHref={author?.id ? `/u/${author.id}` : null}
          images={images}
          heading={heading}
          isOwner={isOwner}
          deletingImageId={deletingImageId}
          isUploadingImages={isUploadingImages}
          isReorderingImages={reorderListingImages.isPending}
          onDeleteImage={handleDeleteImage}
          onUploadImages={handleImagesUpload}
          onReorderImages={handleReorderImages}
          onOpenMessage={() => {
            setMessageDialogOpen(true);
            setMessageFeedback(null);
          }}
          messageFeedback={messageFeedback}
          showMessageCta={!isOwner}
          showOfferCta={canMakeOffer}
          offerCtaLabel={t("actions.makeOffer")}
          onOpenOffer={() => setOfferModalOpen(true)}
        />
      </div>

      {contactHref ? (
        <a
          href={contactHref}
          className="fixed bottom-5 left-4 right-4 z-40 sm:hidden"
        >
          <Button className="w-full py-6 text-base shadow-lg shadow-primary/30">{tl("detail.contact")}</Button>
        </a>
      ) : (
        <Button
          className="fixed bottom-5 left-4 right-4 z-40 py-6 text-base shadow-lg shadow-primary/30 sm:hidden"
          disabled
        >
          {tl("detail.contact")}
        </Button>
      )}

      <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{tl("detail.deleteDialog.title")}</DialogTitle>
            <DialogDescription>{tl("detail.deleteDialog.description")}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <DialogClose asChild>
              <Button variant="outline">{tl("detail.deleteDialog.cancel")}</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDeleteConfirmed} disabled={deleteListing.isPending}>
              {tl("detail.deleteDialog.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{tl("detail.messageDialog.title")}</DialogTitle>
            <DialogDescription>{tl("detail.messageDialog.description")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Textarea
              rows={5}
              value={messageContent}
              onChange={(event) => setMessageContent(event.target.value)}
              placeholder={tl("detail.messageDialog.placeholder")}
              disabled={sendMessage.isPending}
            />
            {messageFeedback ? <p className="text-sm text-muted-foreground">{messageFeedback}</p> : null}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setMessageDialogOpen(false)} disabled={sendMessage.isPending}>
                {tl("detail.messageDialog.cancel")}
              </Button>
              <Button onClick={handleSendMessage} disabled={sendMessage.isPending}>
                {sendMessage.isPending ? tl("detail.messageDialog.submitting") : tl("detail.messageDialog.submit")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {listingId ? (
        <CreateOfferModal
          listingId={listingId as string}
          open={offerModalOpen}
          onOpenChange={setOfferModalOpen}
        />
      ) : null}

      {offerToast ? (
        <div
          role="status"
          className={`fixed right-4 top-4 z-50 rounded-lg border px-4 py-2 text-sm shadow ${
            offerToastVariant === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-700"
          }`}
        >
          {offerToast}
        </div>
      ) : null}
    </div>
  );
}
