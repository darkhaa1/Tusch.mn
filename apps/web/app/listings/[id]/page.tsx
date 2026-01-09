"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { EllipsisVertical } from "lucide-react";
import {
  useCurrentUser,
  useDeleteListing,
  useListing,
  useSendMessage,
  useUpdateListing,
} from "../../hooks/useApi";
import { deleteListingImage, uploadListingImages } from "../../lib/api";
import resolveImageUrl from "../../lib/resolveImageUrl";
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
  Textarea,
} from "@repo/ui";
import { ListingGallery } from "./components/ListingGallery";
import { ListingDetailsCard } from "./components/ListingDetailsCard";
import { ListingSidebar } from "./components/ListingSidebar";
import { CATEGORY_OPTIONS, CATEGORY_LABEL_MAP } from "../../lib/categories";

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const listingId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const { data: listing, isLoading, error, refetch } = useListing(listingId);
  const { data: currentUser } = useCurrentUser();
  const updateListing = useUpdateListing();
  const deleteListing = useDeleteListing();
  const sendMessage = useSendMessage();

  const [isEditing, setIsEditing] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [messageContent, setMessageContent] = useState("");
  const [messageFeedback, setMessageFeedback] = useState<string | null>(null);
  const [formState, setFormState] = useState({
    description: "",
    price: "",
    location: "",
    category: "",
  });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const isOwner = useMemo(() => {
    if (!listing || !currentUser) return false;
    return listing.userId === currentUser.id;
  }, [listing, currentUser]);

  useEffect(() => {
    if (!listing) return;
    setFormState({
      description: listing.description || "",
      price: listing.price?.toString() || "",
      location: listing.location || "",
      category: listing.category || "",
    });
    setSelectedIndex(0);
  }, [listing]);

  const handleSave = async () => {
    if (!listingId) return;
    if (!formState.description.trim()) {
      setFormError("Тайлбар хоосон байна.");
      return;
    }
    const priceNumber = Number(formState.price);
    if (Number.isNaN(priceNumber) || priceNumber < 0) {
      setFormError("Үнэ 0-ээс их эерэг тоо байх ёстой.");
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
    } catch (err: any) {
      setFormError(err?.message || "Хадгалах үед алдаа гарлаа.");
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
    } catch (err: any) {
      setFormError(err?.message || "Устгах үед алдаа гарлаа.");
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
    } catch (err: any) {
      setFormError(err?.message || "Зураг нэмэх үед алдаа гарлаа.");
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
    } catch (err: any) {
      setFormError(err?.message || "Зураг устгах үед алдаа гарлаа.");
    } finally {
      setDeletingImageId(null);
    }
  };

  const handleSendMessage = async () => {
    if (!listing || !listingId || !listing.userId) return;
    if (!currentUser) {
      setMessageFeedback("Мессеж илгээхийн тулд нэвтэрнэ үү.");
      return;
    }
    const content = messageContent.trim();
    if (!content) {
      setMessageFeedback("Мессеж хоосон байна.");
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
      setMessageFeedback("Мессеж илгээлээ.");
    } catch (err: any) {
      setMessageFeedback(err?.message || "Мессеж илгээхэд алдаа гарлаа.");
    }
  };

  if (isLoading) return <p className="py-10 text-center text-muted-foreground">Уншиж байна...</p>;
  if (error) return <p className="py-10 text-center text-destructive">Алдаа гарлаа.</p>;
  if (!listing) return <p className="py-10 text-center text-muted-foreground">Зар олдсонгүй</p>;

  const author = listing.user;
  const authorName = author ? `${author.firstName || ""} ${author.lastName || ""}`.trim() || author.email : "Хэрэглэгч";
  const authorAvatar = resolveImageUrl(author?.avatarUrl);
  const images = listing.images || [];
  const imageUrls = images.map((img) => resolveImageUrl(img.url) || "/placeholder.jpg");
  const displayedMain = imageUrls[selectedIndex] || resolveImageUrl(listing.images?.[0]?.url) || "/placeholder.jpg";
  const categoryValue = isEditing ? formState.category : listing.category;
  const categoryLabel = categoryValue ? CATEGORY_LABEL_MAP.get(categoryValue) || categoryValue : null;
  const heading = categoryLabel || "Зар";
  const priceLabel =
    typeof listing.price === "number" && listing.price > 0 ? `${listing.price.toLocaleString()} ₮` : "Тохиролцоно";
  const contactHref = author?.phone ? `tel:${author.phone}` : author?.email ? `mailto:${author.email}` : null;
  const locationLabel = listing.location || "Байршил оруулаагүй";

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-16 pt-6">
      <div className="mb-4 flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          Буцах
        </Button>
        {isOwner ? (
          <DropdownMenu>
            <DropdownMenuTrigger className="rounded-full border border-border bg-background p-2 hover:bg-muted">
              <EllipsisVertical className="h-5 w-5" aria-hidden="true" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-[180px]">
              {!isEditing ? (
                <DropdownMenuItem onClick={() => setIsEditing(true)}>Засах</DropdownMenuItem>
              ) : null}
              <DropdownMenuItem onClick={() => setConfirmDeleteOpen(true)} className="text-destructive">
                Устгах
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/listings")}>Бүх зарууд</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
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

          <ListingDetailsCard
            heading={heading}
            categoryLabel={categoryLabel}
            listingDescription={listing.description}
            isEditing={isEditing}
            formState={formState}
            onFieldChange={(field, value) => setFormState((prev) => ({ ...prev, [field]: value }))}
            onSave={handleSave}
            onCancel={handleCancelEdit}
            isSaving={updateListing.isPending}
            categories={CATEGORY_OPTIONS}
            formError={formError}
          />
        </div>

        <ListingSidebar
          priceLabel={priceLabel}
          locationLabel={locationLabel}
          categoryLabel={categoryLabel}
          authorName={authorName || "Хэрэглэгч"}
          authorEmail={author?.email}
          authorPhone={author?.phone}
          authorAvatar={authorAvatar}
          profileHref={author?.id ? `/u/${author.id}` : null}
          images={images}
          heading={heading}
          isOwner={isOwner}
          deletingImageId={deletingImageId}
          isUploadingImages={isUploadingImages}
          onDeleteImage={handleDeleteImage}
          onUploadImages={handleImagesUpload}
          onOpenMessage={() => {
            setMessageDialogOpen(true);
            setMessageFeedback(null);
          }}
          messageFeedback={messageFeedback}
          showMessageCta={!isOwner}
        />
      </div>

      {contactHref ? (
        <a
          href={contactHref}
          className="fixed bottom-5 left-4 right-4 z-40 sm:hidden"
        >
          <Button className="w-full py-6 text-base shadow-lg shadow-primary/30">Холбогдох</Button>
        </a>
      ) : (
        <Button
          className="fixed bottom-5 left-4 right-4 z-40 py-6 text-base shadow-lg shadow-primary/30 sm:hidden"
          disabled
        >
          Холбогдох
        </Button>
      )}

      <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Устгах уу?</DialogTitle>
            <DialogDescription>Энэ зарыг устгавал буцаах боломжгүй. Та итгэлтэй байна уу?</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <DialogClose asChild>
              <Button variant="outline">Цуцлах</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDeleteConfirmed} disabled={deleteListing.isPending}>
              Устгах
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Мессеж илгээх</DialogTitle>
            <DialogDescription>Энэ зарын эзэмшигч рүү шууд мессеж илгээнэ.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Textarea
              rows={5}
              value={messageContent}
              onChange={(event) => setMessageContent(event.target.value)}
              placeholder="Мессежээ бичнэ үү..."
              disabled={sendMessage.isPending}
            />
            {messageFeedback ? <p className="text-sm text-muted-foreground">{messageFeedback}</p> : null}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setMessageDialogOpen(false)} disabled={sendMessage.isPending}>
                Цуцлах
              </Button>
              <Button onClick={handleSendMessage} disabled={sendMessage.isPending}>
                {sendMessage.isPending ? "Илгээж байна..." : "Илгээх"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
