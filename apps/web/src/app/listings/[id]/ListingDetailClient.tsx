'use client';

/**
 * Listing detail — Atelier redesign (SA-4).
 * Mobile: full-bleed hero gallery + content stack + sticky bottom CTA bar.
 * Desktop: 1.4fr/1fr grid; gallery + headline + facts + drop-cap description + checklist + reviews
 *          and a sticky aside with pricing card + provider card.
 *
 * All data fetching and mutations are unchanged from the prior version — only UI/JSX.
 */

import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { EllipsisVertical } from 'lucide-react';
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
} from '@web/lib/hooks/useApi';
import { deleteListingImage, uploadListingImages } from '@web/lib/api/listings';
import type { Listing, Offer } from '@web/lib/api/types';
import resolveImageUrl from '@web/lib/resolveImageUrl';
import {
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
  Button as ShadButton,
} from '@web/components/ui';
import { Button, DropCap, LabelMono } from '@web/components/ui-v2';
import { ListingDetailsCard } from '@web/features/listings/components/ListingDetailsCard';
import { CATEGORY_OPTIONS, CATEGORY_LABEL_MAP } from '@web/lib/category-ui';
import { ReportDialogButton } from '@web/components/report/ReportDialogButton';
import { CreateOfferModal } from '@web/features/offers/CreateOfferModal';
import { OffersList } from '@web/features/offers/OffersList';
import { Gallery } from './Gallery';
import { PricingPanel } from './PricingPanel';
import { ProviderCard } from './ProviderCard';

const labels = {
  back: 'Буцах',
  home: 'Нүүр',
  listings: 'Зарууд',
  loading: 'Ачааллаж байна...',
  error: 'Зар уншихад алдаа гарлаа.',
  notFound: 'Зар олдсонгүй.',
  unknownUser: 'Үйлчилгээ үзүүлэгч',
  description: 'Тайлбар',
  whatsIncluded: 'Юу орох вэ',
  reviews: 'Сэтгэгдэл',
  detailsTab: 'Дэлгэрэнгүй',
  offersTab: 'Санал',
  emptyOffersTitle: 'Одоогоор санал ирээгүй',
  emptyOffersDescription: 'Шинэ санал ирмэгц энд харагдана.',
  edit: 'Засах',
  delete: 'Устгах',
  allListings: 'Бүх зар',
  message: 'Зурвас',
  sendOffer: 'Санал илгээх',
  contact: 'Холбогдох',
  // dialogs
  deleteTitle: 'Зар устгах уу?',
  deleteDescription: 'Энэ үйлдлийг буцаах боломжгүй.',
  cancel: 'Болих',
  confirmDelete: 'Устгах',
  messageTitle: 'Зурвас илгээх',
  messageDescription: 'Үйлчилгээ үзүүлэгчтэй харилцах эхлэлийн мессеж.',
  messagePlaceholder: 'Жнь: Сайн уу, та энэ ажлыг хэдэн өдөрт хийх боломжтой вэ?',
  sending: 'Илгээж байна...',
  send: 'Илгээх',
  // included checklist
  includedItems: [
    'Шалны бэлтгэл, цэвэрлэгээ',
    'Бортого тавилт',
    'Тавилга шилжүүлэх',
    'Үнэгүй үнэлгээ — 24 ц',
    'Ажлын дараах цэвэрлэгээ',
    '2 жилийн баталгаа',
  ],
  // errors
  emptyDescription: 'Тайлбар хоосон байна.',
  invalidPrice: 'Үнэ буруу байна.',
  saveError: 'Хадгалахад алдаа гарлаа.',
  deleteError: 'Устгахад алдаа гарлаа.',
  imageUpload: 'Зураг оруулахад алдаа гарлаа.',
  imageDelete: 'Зураг устгахад алдаа гарлаа.',
  imageOrder: 'Зургийн дараалал буруу байна.',
  imageReorder: 'Зургийг дахин эрэмбэлэхэд алдаа гарлаа.',
  messageLogin: 'Нэвтэрнэ үү.',
  messageEmpty: 'Зурвасын агуулга хоосон.',
  messageSent: 'Зурвас илгээлээ.',
  messageError: 'Зурвас илгээхэд алдаа гарлаа.',
  // misc
  priceOnRequest: 'Зөвшилцөнө',
  noLocation: 'Байршил тодорхойгүй',
  posted: 'Зар нийтэлсэн',
};

function formatDateMn(iso?: string): string | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toLocaleDateString('mn-MN', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function ListingDetailClient() {
  const params = useParams();
  const router = useRouter();
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
  const [messageContent, setMessageContent] = useState('');
  const [messageFeedback, setMessageFeedback] = useState<string | null>(null);
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [offerToast, setOfferToast] = useState<string | null>(null);
  const [offerToastVariant, setOfferToastVariant] = useState<'success' | 'error'>('success');
  const [busyOfferId, setBusyOfferId] = useState<string | null>(null);
  const [formState, setFormState] = useState({
    description: '',
    price: '',
    location: '',
    category: '',
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [images, setImages] = useState<NonNullable<Listing['images']>>([]);

  const isOwner = useMemo(() => {
    if (!listing || !currentUser) return false;
    return listing.userId === currentUser.id;
  }, [listing, currentUser]);
  const canReport = Boolean(currentUser) && !isOwner && Boolean(listingId);
  const canMakeOffer =
    Boolean(currentUser) &&
    !isOwner &&
    ['PROVIDER', 'BOTH'].includes(String(currentUser?.role || ''));

  const {
    data: offersByListing,
    isLoading: offersLoading,
    error: offersError,
    refetch: refetchOffers,
  } = useOffersByListing(listingId as string, isOwner);

  useEffect(() => {
    if (!listing) return;
    setFormState({
      description: listing.description || '',
      price: listing.price?.toString() || '',
      location: listing.location || '',
      category: listing.category || '',
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
      setFormError(labels.emptyDescription);
      return;
    }
    const priceNumber = Number(formState.price);
    if (Number.isNaN(priceNumber) || priceNumber < 0) {
      setFormError(labels.invalidPrice);
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
      const message = err instanceof Error ? err.message : '';
      setFormError(message || labels.saveError);
    }
  };

  const handleCancelEdit = () => {
    if (listing) {
      setFormState({
        description: listing.description || '',
        price: listing.price?.toString() || '',
        location: listing.location || '',
        category: listing.category || '',
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
      router.push('/');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '';
      setFormError(message || labels.deleteError);
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
      const message = err instanceof Error ? err.message : '';
      setFormError(message || labels.imageUpload);
    } finally {
      setIsUploadingImages(false);
      event.target.value = '';
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!listingId) return;
    setDeletingImageId(imageId);
    try {
      await deleteListingImage(listingId, imageId);
      await refetch();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '';
      setFormError(message || labels.imageDelete);
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
      .filter((image): image is NonNullable<Listing['images']>[number] => Boolean(image));

    if (reorderedImages.length !== previousImages.length) {
      setFormError(labels.imageOrder);
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
      await reorderListingImages.mutateAsync({ listingId, imageIds: nextImageIds });
    } catch (err: unknown) {
      setImages(previousImages);
      if (selectedImageId) {
        const previousIndex = previousImages.findIndex((image) => image.id === selectedImageId);
        if (previousIndex >= 0) {
          setSelectedIndex(previousIndex);
        }
      }
      const message = err instanceof Error ? err.message : '';
      setFormError(message || labels.imageReorder);
    }
  };

  const handleSendMessage = async () => {
    if (!listing || !listingId || !listing.userId) return;
    if (!currentUser) {
      setMessageFeedback(labels.messageLogin);
      return;
    }
    const content = messageContent.trim();
    if (!content) {
      setMessageFeedback(labels.messageEmpty);
      return;
    }
    setMessageFeedback(null);
    try {
      await sendMessage.mutateAsync({
        recipientId: listing.userId,
        listingId,
        content,
      });
      setMessageContent('');
      setMessageDialogOpen(false);
      setMessageFeedback(labels.messageSent);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '';
      setMessageFeedback(message || labels.messageError);
    }
  };

  const handleAcceptOffer = async (offer: Offer) => {
    setBusyOfferId(offer.id);
    setOfferToastVariant('success');
    try {
      await acceptOffer.mutateAsync({ offerId: offer.id });
      setOfferToast('Санал хүлээн зөвшөөрсөн');
      await refetchOffers();
    } catch (err) {
      setOfferToastVariant('error');
      setOfferToast(err instanceof Error ? err.message : 'Алдаа гарлаа');
    } finally {
      setBusyOfferId(null);
    }
  };

  const handleRejectOffer = async (offer: Offer) => {
    setBusyOfferId(offer.id);
    setOfferToastVariant('success');
    try {
      await rejectOffer.mutateAsync({ offerId: offer.id });
      setOfferToast('Санал татгалзсан');
      await refetchOffers();
    } catch (err) {
      setOfferToastVariant('error');
      setOfferToast(err instanceof Error ? err.message : 'Алдаа гарлаа');
    } finally {
      setBusyOfferId(null);
    }
  };

  const handleShare = async () => {
    if (typeof navigator === 'undefined') return;
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (navigator.share) {
      try {
        await navigator.share({ url });
      } catch {
        /* user dismissed */
      }
    } else if (navigator.clipboard && url) {
      try {
        await navigator.clipboard.writeText(url);
      } catch {
        /* ignore */
      }
    }
  };

  if (isLoading) {
    return (
      <div className="bg-atelier-paper">
        <p
          className="py-16 text-center text-atelier-muted"
          style={{ fontFamily: 'var(--at-serif)', fontStyle: 'var(--at-italic-style, italic)' }}
        >
          {labels.loading}
        </p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="bg-atelier-paper">
        <p
          className="py-16 text-center text-atelier-pourpre"
          style={{ fontFamily: 'var(--at-serif)' }}
        >
          {labels.error}
        </p>
      </div>
    );
  }
  if (!listing) {
    return (
      <div className="bg-atelier-paper">
        <p
          className="py-16 text-center text-atelier-muted"
          style={{ fontFamily: 'var(--at-serif)', fontStyle: 'var(--at-italic-style, italic)' }}
        >
          {labels.notFound}
        </p>
      </div>
    );
  }

  const author = listing.user;
  const authorName = author
    ? `${author.firstName || ''} ${author.lastName || ''}`.trim() || author.email || ''
    : '';
  const authorAvatar = resolveImageUrl(author?.avatarUrl) || undefined;
  const imageUrls = images
    .map((img) => resolveImageUrl(img.url))
    .filter((u): u is string => Boolean(u));

  const categoryValue = isEditing ? formState.category : listing.category;
  const categoryLabel = categoryValue ? CATEGORY_LABEL_MAP.get(categoryValue) || categoryValue : null;
  const headingPrefix = categoryLabel || 'Үйлчилгээ';
  const description = listing.description || '';
  const locationLabel = listing.location || labels.noLocation;
  const postedLabel = formatDateMn(listing.createdAt);
  const memberSinceYear = author && 'createdAt' in (author as Record<string, unknown>)
    ? new Date((author as { createdAt?: string }).createdAt || '').getFullYear() || null
    : null;
  const contactHref = author?.phone ? `tel:${author.phone}` : author?.email ? `mailto:${author.email}` : null;

  return (
    <div className="bg-atelier-paper text-atelier-ink">
      <div className="mx-auto w-full max-w-6xl px-4 pb-32 pt-4 md:px-14 md:pt-6 md:pb-12">
        {/* Breadcrumb + actions */}
        <div className="hidden md:flex items-center justify-between gap-4">
          <nav
            aria-label="Breadcrumb"
            className="text-atelier-muted"
            style={{
              fontFamily: 'var(--at-mono)',
              fontSize: 11,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            {labels.home} <span className="mx-2">/</span> {labels.listings}
            {categoryLabel && (
              <>
                {' '}
                <span className="mx-2">/</span> {categoryLabel}
              </>
            )}
          </nav>

          <div className="flex items-center gap-2">
            {canReport && (
              <ReportDialogButton
                targetType="LISTING"
                targetId={listingId as string}
                variant="outline"
                size="sm"
              />
            )}
            {isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger className="rounded-full border border-atelier-line bg-atelier-cream p-2 hover:bg-atelier-sand">
                  <EllipsisVertical className="h-4 w-4" aria-hidden="true" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="min-w-45">
                  {!isEditing && (
                    <DropdownMenuItem onClick={() => setIsEditing(true)}>{labels.edit}</DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => setConfirmDeleteOpen(true)} className="text-destructive">
                    {labels.delete}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/listings')}>
                    {labels.allListings}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Owner actions overlap mobile gallery top-right — provided via dropdown there too */}
        {isOwner && (
          <div className="md:hidden absolute right-4 top-3 z-10">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex h-9 w-9 items-center justify-center rounded-full bg-atelier-cream shadow-sm">
                <EllipsisVertical className="h-4 w-4 text-atelier-ink" aria-hidden="true" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="min-w-45">
                {!isEditing && (
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>{labels.edit}</DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => setConfirmDeleteOpen(true)} className="text-destructive">
                  {labels.delete}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/listings')}>
                  {labels.allListings}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* Main grid */}
        <section
          className="mt-4 grid gap-8 md:mt-6"
          style={{ gridTemplateColumns: 'minmax(0, 1fr)' }}
        >
          <div
            className="grid gap-8 md:gap-10"
            style={{
              gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
            }}
          >
            {/* Left column — gallery + content */}
            <div className="min-w-0 md:col-start-1 col-span-2 md:col-span-1">
              <Gallery
                imageUrls={imageUrls}
                selectedIndex={selectedIndex}
                onSelect={setSelectedIndex}
                onBack={() => router.back()}
                onShare={handleShare}
                onFavorite={undefined}
                altPrefix={headingPrefix}
              />

              <div className="px-4 pt-5 md:px-0 md:pt-9">
                <LabelMono tone="terre" style={{ letterSpacing: '0.2em' }}>
                  {categoryLabel ? `${categoryLabel}` : 'Үйлчилгээ'}
                </LabelMono>

                <h1
                  className="text-atelier-ink"
                  style={{
                    fontFamily: 'var(--at-serif)',
                    fontWeight: 400,
                    fontSize: 'clamp(26px, 4vw, 52px)',
                    lineHeight: 1.08,
                    letterSpacing: '-0.04em',
                    margin: '10px 0 0',
                  }}
                >
                  {description ? (
                    description
                  ) : (
                    <em style={{ fontStyle: 'var(--at-italic-style, italic)', color: 'var(--at-muted)' }}>
                      {headingPrefix}
                    </em>
                  )}
                </h1>

                {/* Facts row */}
                <div
                  className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 pb-5 text-atelier-ink"
                  style={{
                    borderBottom: '1px solid var(--at-line)',
                    fontFamily: 'var(--at-serif)',
                    fontSize: 14,
                  }}
                >
                  <span style={{ fontStyle: 'var(--at-italic-style, italic)' }}>
                    <b style={{ fontStyle: 'normal' }}>{locationLabel}</b>
                  </span>
                  {postedLabel && (
                    <span style={{ fontStyle: 'var(--at-italic-style, italic)' }} className="text-atelier-muted">
                      {labels.posted} · <b style={{ fontStyle: 'normal', color: 'var(--at-ink)' }}>{postedLabel}</b>
                    </span>
                  )}
                </div>

                {/* Mobile pricing summary row */}
                <div
                  className="flex items-center justify-between gap-6 py-5 md:hidden"
                  style={{ borderBottom: '1px solid var(--at-line)' }}
                >
                  <div>
                    <LabelMono>{labels.posted}</LabelMono>
                    <div
                      className="text-atelier-ink"
                      style={{ fontFamily: 'var(--at-serif)', fontSize: 28, letterSpacing: '-0.03em', marginTop: 4, lineHeight: 1 }}
                    >
                      {typeof listing.price === 'number' && listing.price > 0 ? (
                        <>
                          {listing.price.toLocaleString('mn-MN')}
                          <em style={{ fontStyle: 'var(--at-italic-style, italic)', fontSize: 18, marginLeft: 2 }}>₮</em>
                        </>
                      ) : (
                        <span style={{ fontStyle: 'var(--at-italic-style, italic)', fontSize: 20 }}>{labels.priceOnRequest}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <LabelMono>Үнэлгээ</LabelMono>
                    <div
                      className="text-atelier-ink"
                      style={{ fontFamily: 'var(--at-serif)', fontStyle: 'var(--at-italic-style, italic)', fontSize: 16, marginTop: 4 }}
                    >
                      24 цагт
                    </div>
                  </div>
                </div>

                {/* Description */}
                {!isOwner && description && (
                  <div className="mt-6 md:mt-8">
                    <div className="mb-3 md:mb-4">
                      <LabelMono>{labels.description}</LabelMono>
                    </div>
                    <DropCap color="var(--at-terre)" size={44}>
                      {description}
                    </DropCap>
                  </div>
                )}

                {/* What's included — desktop visual element from the design */}
                <div className="mt-8 hidden md:block">
                  <div className="mb-3">
                    <LabelMono>{labels.whatsIncluded}</LabelMono>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {labels.includedItems.map((item) => (
                      <div
                        key={item}
                        className="flex items-start gap-2 text-atelier-ink"
                        style={{ fontFamily: 'var(--at-serif)', fontSize: 15 }}
                      >
                        <span
                          aria-hidden="true"
                          className="text-atelier-cobalt"
                          style={{ fontStyle: 'var(--at-italic-style, italic)' }}
                        >
                          ✓
                        </span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Owner editing card / Tabs */}
                {isOwner && (
                  <div className="mt-8">
                    <Tabs defaultValue="details" className="space-y-4">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="details" className="w-full">
                          {labels.detailsTab}
                        </TabsTrigger>
                        <TabsTrigger value="offers" className="w-full">
                          {labels.offersTab}
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="details">
                        <ListingDetailsCard
                          heading={headingPrefix}
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
                          emptyTitle={labels.emptyOffersTitle}
                          emptyDescription={labels.emptyOffersDescription}
                        />
                      </TabsContent>
                    </Tabs>

                    {/* Owner-only image management */}
                    <div className="mt-6 grid gap-3">
                      <LabelMono>Зургийн удирдлага</LabelMono>
                      <div className="flex flex-wrap items-center gap-3">
                        <label
                          className="inline-flex cursor-pointer items-center border border-atelier-ink px-4 py-2 text-atelier-ink hover:bg-atelier-ink hover:text-atelier-cream"
                          style={{ fontFamily: 'var(--at-serif)', fontStyle: 'var(--at-italic-style, italic)', fontSize: 14 }}
                        >
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImagesUpload}
                            disabled={isUploadingImages}
                            className="hidden"
                          />
                          {isUploadingImages ? 'Хуулж байна...' : 'Зураг нэмэх'}
                        </label>
                        {reorderListingImages.isPending && (
                          <span className="text-atelier-muted" style={{ fontFamily: 'var(--at-mono)', fontSize: 11 }}>
                            Эрэмбэлж байна...
                          </span>
                        )}
                      </div>
                      {images.length > 0 && (
                        <ul className="flex flex-wrap gap-3">
                          {images.map((img) => (
                            <li key={img.id} className="relative">
                              <div
                                className="h-20 w-20 overflow-hidden"
                                style={{ border: '1px solid var(--at-line)' }}
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={resolveImageUrl(img.url) || ''}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => handleDeleteImage(img.id)}
                                disabled={deletingImageId === img.id}
                                className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-atelier-ink text-atelier-cream"
                                style={{ fontFamily: 'var(--at-mono)', fontSize: 11 }}
                                aria-label="Зураг устгах"
                              >
                                ×
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                      {formError && (
                        <p className="text-atelier-pourpre" style={{ fontFamily: 'var(--at-serif)', fontSize: 13 }}>
                          {formError}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Reviews placeholder section — desktop visual element */}
                <div
                  className="mt-10 hidden md:block pt-7"
                  style={{ borderTop: '1px solid var(--at-line)' }}
                >
                  <div className="mb-3">
                    <LabelMono>{labels.reviews}</LabelMono>
                  </div>
                  <p
                    className="text-atelier-muted"
                    style={{ fontFamily: 'var(--at-serif)', fontStyle: 'var(--at-italic-style, italic)', fontSize: 14 }}
                  >
                    Сэтгэгдэл удахгүй нэмэгдэнэ.
                  </p>
                </div>
              </div>
            </div>

            {/* Right sticky aside */}
            <aside className="hidden md:block min-w-0">
              <div className="sticky top-24 space-y-4">
                <PricingPanel
                  price={listing.price}
                  categoryLabel={categoryLabel}
                  locationLabel={listing.location || labels.noLocation}
                  postedLabel={postedLabel}
                  canSendOffer={canMakeOffer}
                  canMessage={Boolean(currentUser) && !isOwner}
                  onSendOffer={() => setOfferModalOpen(true)}
                  onMessage={() => {
                    setMessageDialogOpen(true);
                    setMessageFeedback(null);
                  }}
                />

                {author && (
                  <ProviderCard
                    name={authorName || labels.unknownUser}
                    avatar={authorAvatar}
                    city={listing.location || null}
                    memberSinceYear={memberSinceYear}
                    profileHref={author.id ? `/u/${author.id}` : null}
                  />
                )}
              </div>
            </aside>
          </div>
        </section>

        {/* Mobile provider row (replaces sticky aside on mobile) */}
        {author && (
          <div className="md:hidden mt-6 px-4">
            <ProviderCard
              name={authorName || labels.unknownUser}
              avatar={authorAvatar}
              city={listing.location || null}
              memberSinceYear={memberSinceYear}
              profileHref={author.id ? `/u/${author.id}` : null}
            />
          </div>
        )}

        {messageFeedback && (
          <p
            role="status"
            className="mt-4 px-4 text-center text-atelier-muted md:hidden"
            style={{ fontFamily: 'var(--at-serif)', fontStyle: 'var(--at-italic-style, italic)', fontSize: 13 }}
          >
            {messageFeedback}
          </p>
        )}
      </div>

      {/* Mobile sticky bottom CTA bar */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 flex gap-2 bg-atelier-paper px-4 py-3 md:hidden"
        style={{ borderTop: '1px solid var(--at-line)' }}
      >
        {Boolean(currentUser) && !isOwner ? (
          <Button
            variant="outline"
            size="lg"
            italic
            onClick={() => {
              setMessageDialogOpen(true);
              setMessageFeedback(null);
            }}
            className="flex-1"
          >
            {labels.message}
          </Button>
        ) : contactHref ? (
          <a href={contactHref} className="flex-1">
            <Button variant="outline" size="lg" italic full>
              {labels.contact}
            </Button>
          </a>
        ) : (
          <Button variant="outline" size="lg" italic full disabled className="flex-1">
            {labels.contact}
          </Button>
        )}

        {canMakeOffer ? (
          <Button
            variant="primary"
            size="lg"
            onClick={() => setOfferModalOpen(true)}
            className="flex-[1.4]"
          >
            {labels.sendOffer}
          </Button>
        ) : (
          <Button variant="primary" size="lg" disabled className="flex-[1.4]">
            {labels.sendOffer}
          </Button>
        )}
      </div>

      {/* Delete confirm */}
      <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{labels.deleteTitle}</DialogTitle>
            <DialogDescription>{labels.deleteDescription}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <DialogClose asChild>
              <ShadButton variant="outline">{labels.cancel}</ShadButton>
            </DialogClose>
            <ShadButton variant="destructive" onClick={handleDeleteConfirmed} disabled={deleteListing.isPending}>
              {labels.confirmDelete}
            </ShadButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Message dialog */}
      <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{labels.messageTitle}</DialogTitle>
            <DialogDescription>{labels.messageDescription}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Textarea
              rows={5}
              value={messageContent}
              onChange={(event) => setMessageContent(event.target.value)}
              placeholder={labels.messagePlaceholder}
              disabled={sendMessage.isPending}
            />
            {messageFeedback && <p className="text-sm text-muted-foreground">{messageFeedback}</p>}
            <div className="flex justify-end gap-2">
              <ShadButton
                variant="outline"
                onClick={() => setMessageDialogOpen(false)}
                disabled={sendMessage.isPending}
              >
                {labels.cancel}
              </ShadButton>
              <ShadButton onClick={handleSendMessage} disabled={sendMessage.isPending}>
                {sendMessage.isPending ? labels.sending : labels.send}
              </ShadButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {listingId && (
        <CreateOfferModal
          listingId={listingId as string}
          open={offerModalOpen}
          onOpenChange={setOfferModalOpen}
        />
      )}

      {offerToast && (
        <div
          role="status"
          className={`fixed right-4 top-4 z-50 rounded-none border px-4 py-2 text-sm shadow ${
            offerToastVariant === 'success'
              ? 'border-atelier-olive bg-atelier-paper text-atelier-olive'
              : 'border-atelier-pourpre bg-atelier-paper text-atelier-pourpre'
          }`}
          style={{ fontFamily: 'var(--at-serif)', fontStyle: 'var(--at-italic-style, italic)' }}
        >
          {offerToast}
        </div>
      )}
    </div>
  );
}
