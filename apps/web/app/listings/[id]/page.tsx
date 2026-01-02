"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MapPin, EllipsisVertical } from "lucide-react";
import {
  useCurrentUser, useDeleteListing, useListing, useUpdateListing,
} from "../../hooks/useApi";
import { deleteListingImage, uploadListingImages } from "../../lib/api";
import resolveImageUrl from "../../lib/resolveImageUrl";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import Select from "../../components/ui/select";
import Avatar from "../../components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { cn } from "../../lib/utils";

const categories = [
  { value: "network_repair", label: "Дотоод сүлжээ / интернет засвар" },
  { value: "moving", label: "Нүүлгэлт" },
  { value: "home_cleaning", label: "Гэр цэвэрлэгээ" },
  { value: "dog_walking", label: "Нохой салхилуулах" },
  { value: "carpentry", label: "Модон ажил / мужаан" },
  { value: "auto_repair", label: "Авто засвар" },
  { value: "babysitting", label: "Хүүхэд асрах" },
  { value: "tutoring", label: "Хичээл заах" },
];

const categoryLabelMap = new Map(categories.map((category) => [category.value, category.label]));

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const listingId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const { data: listing, isLoading, error, refetch } = useListing(listingId);
  const { data: currentUser } = useCurrentUser();
  const updateListing = useUpdateListing();
  const deleteListing = useDeleteListing();

  const [isEditing, setIsEditing] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
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

  const handleChange =
    (field: keyof typeof formState) =>
      (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormState((prev) => ({ ...prev, [field]: event.target.value }));
      };

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
  const categoryLabel = categoryValue ? categoryLabelMap.get(categoryValue) || categoryValue : null;
  const heading = categoryLabel || "Зар";
  const priceLabel =
    typeof listing.price === "number" && listing.price > 0 ? `${listing.price.toLocaleString()} ₮` : "Тохиролцоно";
  const contactHref = author?.phone ? `tel:${author.phone}` : author?.email ? `mailto:${author.email}` : null;

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
          <Card className="overflow-hidden">
            <div className="relative">
              <div className="aspect-[4/3] w-full bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={displayedMain} alt={heading} className="h-full w-full object-cover" />
              </div>
              <div className="absolute bottom-3 left-3 flex gap-2 rounded-full bg-black/50 px-3 py-1 text-xs text-white backdrop-blur">
                <span>{categoryLabel || "Ангилалгүй"}</span>
              </div>
            </div>
            <div className="flex gap-3 overflow-x-auto p-4">
              {[displayedMain, ...imageUrls.filter((_, idx) => idx !== selectedIndex)].slice(0, 4).map((url, idx) => {
                const originalIndex = imageUrls.indexOf(url);
                const active = originalIndex === selectedIndex;
                return (
                  <button
                    key={`${url}-${idx}`}
                    type="button"
                    onClick={() => setSelectedIndex(originalIndex >= 0 ? originalIndex : 0)}
                    className={cn(
                      "relative h-20 w-28 flex-shrink-0 overflow-hidden rounded-lg border transition",
                      active ? "ring-2 ring-primary" : "hover:border-primary/60"
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={heading} className="h-full w-full object-cover" />
                  </button>
                );
              })}
              {!imageUrls.length && (
                <div className="h-20 w-28 flex-shrink-0 overflow-hidden rounded-lg border bg-muted" />
              )}
            </div>
          </Card>

          <Card>
            <CardContent className="space-y-4 p-6">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-semibold leading-tight text-foreground">{heading}</h1>
                {categoryLabel ? <Badge variant="secondary">{categoryLabel}</Badge> : null}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" aria-hidden="true" />
                <span>{listing.location || "Байршил оруулаагүй"}</span>
              </div>

              {isEditing ? (
                <div className="space-y-3">
                  <Textarea
                    rows={6}
                    value={formState.description}
                    onChange={handleChange("description")}
                    disabled={updateListing.isPending}
                    placeholder="Тайлбараа оруулна уу..."
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input
                      type="number"
                      value={formState.price}
                      onChange={handleChange("price")}
                      disabled={updateListing.isPending}
                      placeholder="Үнэ"
                    />
                    <Input
                      value={formState.location}
                      onChange={handleChange("location")}
                      disabled={updateListing.isPending}
                      placeholder="Байршил"
                    />
                  </div>
                  <Select value={formState.category} onChange={handleChange("category")} disabled={updateListing.isPending}>
                    <option value="">Ангилал сонгох</option>
                    {categories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </Select>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button onClick={handleSave} disabled={updateListing.isPending}>
                      Хадгалах
                    </Button>
                    <Button variant="outline" onClick={handleCancelEdit} disabled={updateListing.isPending}>
                      Цуцлах
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-base leading-relaxed text-foreground">{listing.description}</p>
              )}

              {formError && <p className="text-sm text-destructive">{formError}</p>}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="space-y-4 p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="text-xs uppercase text-muted-foreground">Үнэ</div>
                  <div className="text-3xl font-semibold text-primary">{priceLabel}</div>
                </div>
              </div>

              <div className="space-y-2 rounded-lg border border-border/80 bg-background p-3">
                <div className="text-xs uppercase text-muted-foreground">Байршил</div>
                <div className="text-sm text-foreground">{listing.location || "Байршил оруулаагүй"}</div>
              </div>

              <div className="space-y-2 rounded-lg border border-border/80 bg-background p-3">
                <div className="text-xs uppercase text-muted-foreground">Ангилал</div>
                <div className="text-sm text-foreground">
                  {listing.category ? categoryLabelMap.get(listing.category) || listing.category : "Ангилалгүй"}
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg border border-border/80 bg-background p-3">
                <Avatar src={authorAvatar} alt={authorName} />
                <div className="space-y-1 text-sm text-foreground">
                  <div className="font-medium text-foreground">{authorName || "Хэрэглэгч"}</div>
                  {author?.email && <div className="text-muted-foreground">{author.email}</div>}
                  {author?.phone && <div className="text-muted-foreground">{author.phone}</div>}
                </div>
              </div>

              {isOwner ? (
                <div className="space-y-2">
                  <div className="text-xs uppercase text-muted-foreground">Зураг</div>
                  <div className="flex flex-wrap gap-2">
                    {images.map((image) => (
                      <div key={image.id} className="relative h-24 w-24 overflow-hidden rounded-lg border">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={resolveImageUrl(image.url) || "/placeholder.jpg"} alt={heading} className="h-full w-full object-cover" />
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteImage(image.id)}
                          disabled={deletingImageId === image.id}
                          className="absolute right-1 top-1 h-6 px-2 text-xs"
                        >
                          Устгах
                        </Button>
                      </div>
                    ))}
                    {images.length < 3 && (
                      <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed text-xs text-muted-foreground">
                        Зураг нэмэх
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={handleImagesUpload}
                          disabled={isUploadingImages}
                        />
                      </label>
                    )}
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
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
    </div>
  );
}
