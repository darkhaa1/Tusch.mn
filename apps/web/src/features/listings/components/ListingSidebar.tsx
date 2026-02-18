"use client";

import { GripVertical } from "lucide-react";
import type { ChangeEvent } from "react";
import Link from "next/link";
import { Avatar, Button } from "@web/components/ui";
import resolveImageUrl from "@web/lib/resolveImageUrl";

type ListingSidebarProps = {
  priceLabel: string;
  locationLabel: string;
  categoryLabel: string | null;
  authorName: string;
  authorEmail?: string | null;
  authorPhone?: string | null;
  authorAvatar?: string | null;
  profileHref?: string | null;
  images: Array<{ id: string; url: string; thumbnailUrl?: string | null }>;
  heading: string;
  isOwner: boolean;
  deletingImageId: string | null;
  isUploadingImages: boolean;
  isReorderingImages: boolean;
  onDeleteImage: (id: string) => void;
  onUploadImages: (event: ChangeEvent<HTMLInputElement>) => void;
  onReorderImages: (imageIds: string[]) => void;
  onOpenMessage: () => void;
  messageFeedback: string | null;
  showMessageCta: boolean;
};

export function ListingSidebar({
  priceLabel,
  locationLabel,
  categoryLabel,
  authorName,
  authorAvatar,
  profileHref,
  images,
  heading,
  isOwner,
  deletingImageId,
  isUploadingImages,
  isReorderingImages,
  onDeleteImage,
  onUploadImages,
  onReorderImages,
  onOpenMessage,
  messageFeedback,
  showMessageCta,
}: ListingSidebarProps) {
  const handleDrop = (draggedId: string, targetId: string) => {
    if (draggedId === targetId) return;

    const nextImages = [...images];
    const fromIndex = nextImages.findIndex((image) => image.id === draggedId);
    const toIndex = nextImages.findIndex((image) => image.id === targetId);
    if (fromIndex < 0 || toIndex < 0) return;

    const [draggedImage] = nextImages.splice(fromIndex, 1);
    if (!draggedImage) return;
    nextImages.splice(toIndex, 0, draggedImage);
    onReorderImages(nextImages.map((image) => image.id));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4 rounded-xl border border-border/80 bg-background p-6">
        <div className="space-y-2">
          <div className="text-xs uppercase text-muted-foreground">Үнэ</div>
          <div className="text-3xl font-semibold text-primary">{priceLabel}</div>
        </div>

        <div className="space-y-2 rounded-lg border border-border/80 bg-background p-3">
          <div className="text-xs uppercase text-muted-foreground">Байршил</div>
          <div className="text-sm text-foreground">{locationLabel}</div>
        </div>

        <div className="space-y-2 rounded-lg border border-border/80 bg-background p-3">
          <div className="text-xs uppercase text-muted-foreground">Ангилал</div>
          <div className="text-sm text-foreground">{categoryLabel || "Ангилалгүй"}</div>
        </div>

        {profileHref ? (
          <Link
            href={profileHref}
            prefetch={false}
            className="flex items-center gap-3 rounded-lg border border-border/80 bg-background p-3 transition hover:border-primary/50"
          >
            <Avatar src={authorAvatar} alt={authorName} />
            <div className="space-y-1 text-sm text-foreground">
              <div className="font-medium text-foreground">{authorName || "Хэрэглэгч"}</div>
            </div>
          </Link>
        ) : (
          <div className="flex items-center gap-3 rounded-lg border border-border/80 bg-background p-3">
            <Avatar src={authorAvatar} alt={authorName} />
          </div>
        )}

        {showMessageCta ? (
          <div className="space-y-2">
            <Button className="w-full" onClick={onOpenMessage}>
              Мессеж илгээх
            </Button>
            {messageFeedback ? <p className="text-sm text-muted-foreground">{messageFeedback}</p> : null}
          </div>
        ) : null}
      </div>

      {isOwner ? (
        <div className="space-y-2 rounded-xl border border-border/80 bg-background p-6">
          <div className="text-xs uppercase text-muted-foreground">Зураг</div>
          <div className="flex flex-wrap gap-2">
            {images.map((image) => (
              <div
                key={image.id}
                className="relative h-24 w-24 overflow-hidden rounded-lg border"
                draggable={!isReorderingImages}
                onDragStart={(event) => {
                  event.dataTransfer.effectAllowed = "move";
                  event.dataTransfer.setData("text/plain", image.id);
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  event.dataTransfer.dropEffect = "move";
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  const draggedId = event.dataTransfer.getData("text/plain");
                  if (!draggedId) return;
                  handleDrop(draggedId, image.id);
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={resolveImageUrl(image.thumbnailUrl) || resolveImageUrl(image.url) || "/placeholder.jpg"} alt={heading} className="h-full w-full object-cover" />
                <div className="absolute left-1 top-1 rounded bg-black/50 p-1 text-white">
                  <GripVertical className="h-4 w-4" aria-hidden="true" />
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={() => onDeleteImage(image.id)}
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
                  onChange={onUploadImages}
                  disabled={isUploadingImages}
                />
              </label>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
