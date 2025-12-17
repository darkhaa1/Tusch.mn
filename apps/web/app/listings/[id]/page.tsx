"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  useCurrentUser,
  useDeleteListing,
  useListing,
  useUpdateListing,
} from "../../hooks/useApi";
import resolveAvatarUrl from "../../profile/components/avatarUrl";

const categories = [
  { value: "network_repair", label: "Шугам сүлжээ засвар угсралт" },
  { value: "moving", label: "Нүүлгэлт" },
  { value: "home_cleaning", label: "Гэр цэвэрлэгээ" },
  { value: "dog_walking", label: "Нохой салхилуулах" },
  { value: "carpentry", label: "Мужаан, тавилга угсралт" },
  { value: "auto_repair", label: "Авто засвар" },
  { value: "babysitting", label: "Хүүхэд асрагч" },
  { value: "tutoring", label: "Гэрийн багш" },
];

const categoryLabelMap = new Map(
  categories.map((category) => [category.value, category.label])
);

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const listingId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const { data: listing, isLoading, error } = useListing(listingId);
  const { data: currentUser } = useCurrentUser();
  const updateListing = useUpdateListing();
  const deleteListing = useDeleteListing();

  const [isEditing, setIsEditing] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formState, setFormState] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
    category: "",
  });

  const isOwner = useMemo(() => {
    if (!listing || !currentUser) return false;
    return listing.userId === currentUser.id;
  }, [listing, currentUser]);

  useEffect(() => {
    if (!listing) return;
    setFormState({
      title: listing.title || "",
      description: listing.description || "",
      price: listing.price?.toString() || "",
      location: listing.location || "",
      category: listing.category || "",
    });
  }, [listing]);

  const handleChange =
    (field: keyof typeof formState) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setFormState((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleSave = async () => {
    if (!listingId) return;
    if (!formState.title.trim() || !formState.description.trim()) {
      setFormError("Гарчиг болон дэлгэрэнгүйг бөглөнө үү");
      return;
    }
    const priceNumber = Number(formState.price);
    if (Number.isNaN(priceNumber) || priceNumber < 0) {
      setFormError("Үнэ зөв оруулна уу");
      return;
    }
    setFormError(null);
    try {
      await updateListing.mutateAsync({
        id: listingId,
        data: {
          title: formState.title.trim(),
          description: formState.description.trim(),
          price: priceNumber,
          location: formState.location.trim() || undefined,
          category: formState.category || undefined,
        },
      });
      setIsEditing(false);
    } catch (err: any) {
      setFormError(err?.message || "Зар засах үед алдаа гарлаа");
    }
  };

  const handleCancelEdit = () => {
    if (listing) {
      setFormState({
        title: listing.title || "",
        description: listing.description || "",
        price: listing.price?.toString() || "",
        location: listing.location || "",
        category: listing.category || "",
      });
    }
    setIsEditing(false);
    setFormError(null);
  };

  const handleDelete = async () => {
    if (!listingId) return;
    const confirmed = window.confirm("Зарыг устгах уу?");
    if (!confirmed) return;
    setFormError(null);
    try {
      await deleteListing.mutateAsync(listingId);
      router.push("/");
    } catch (err: any) {
      setFormError(err?.message || "Зар устгах үед алдаа гарлаа");
    }
  };

  if (isLoading) return <p className="py-10 text-center">Ачааллаж байна...</p>;
  if (error) return <p className="py-10 text-center text-red-500">Алдаа гарлаа</p>;
  if (!listing) return <p className="py-10 text-center">Зар олдсонгүй</p>;

  const author = listing.user;
  const authorName = author ? `${author.firstName} ${author.lastName}` : "Тодорхойгүй";
  const authorAvatar = resolveAvatarUrl(author?.avatarUrl);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <button
        onClick={() => router.back()}
        className="mb-4 rounded border px-3 py-1.5 text-sm text-gray-700 transition hover:bg-gray-100"
        type="button"
      >
        ← Буцах
      </button>
      <div className="mb-6 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="flex-1 space-y-3">
          {isEditing ? (
            <input
              className="w-full rounded border px-3 py-2 text-xl font-semibold"
              value={formState.title}
              onChange={handleChange("title")}
              disabled={updateListing.isPending}
            />
          ) : (
            <h1 className="text-2xl font-semibold">{listing.title}</h1>
          )}

          <div className="text-sm text-gray-500">
            {new Date(listing.createdAt).toLocaleDateString()}
          </div>

          {isEditing ? (
            <textarea
              rows={6}
              className="w-full rounded border px-3 py-2"
              value={formState.description}
              onChange={handleChange("description")}
              disabled={updateListing.isPending}
            />
          ) : (
            <p className="text-gray-700">{listing.description}</p>
          )}
        </div>

        <div className="w-full max-w-sm space-y-4 rounded-xl border bg-white p-4 shadow-sm">
          <div className="space-y-1">
            <div className="text-xs uppercase text-gray-400">Үнэ</div>
            {isEditing ? (
              <input
                type="number"
                className="w-full rounded border px-3 py-2"
                value={formState.price}
                onChange={handleChange("price")}
                disabled={updateListing.isPending}
              />
            ) : (
              <div className="text-xl font-semibold text-blue-600">
                {listing.price.toLocaleString()} ₮
              </div>
            )}
          </div>

          <div className="space-y-1">
            <div className="text-xs uppercase text-gray-400">Категори</div>
            {isEditing ? (
              <select
                className="w-full rounded border px-3 py-2"
                value={formState.category}
                onChange={handleChange("category")}
                disabled={updateListing.isPending}
              >
                <option value="">Сонгох</option>
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            ) : (
              <div className="text-gray-700">
                {listing.category
                  ? categoryLabelMap.get(listing.category) || listing.category
                  : "Сонгогдоогүй"}
              </div>
            )}
          </div>

          <div className="space-y-1">
            <div className="text-xs uppercase text-gray-400">Байршил</div>
            {isEditing ? (
              <input
                className="w-full rounded border px-3 py-2"
                value={formState.location}
                onChange={handleChange("location")}
                disabled={updateListing.isPending}
              />
            ) : (
              <div className="text-gray-700">
                {listing.location || "Байршил тодорхойгүй"}
              </div>
            )}
          </div>

          {isOwner && (
            <div className="flex flex-col gap-2 pt-2">
              {isEditing ? (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="flex-1 rounded bg-blue-600 px-4 py-2 text-sm text-white disabled:opacity-60"
                    disabled={updateListing.isPending}
                    type="button"
                  >
                    Хадгалах
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="flex-1 rounded border px-4 py-2 text-sm"
                    disabled={updateListing.isPending}
                    type="button"
                  >
                    Цуцлах
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="rounded border px-4 py-2 text-sm"
                  type="button"
                >
                  Засах
                </button>
              )}

              <button
                onClick={handleDelete}
                className="rounded border border-red-500 px-4 py-2 text-sm text-red-600 disabled:opacity-60"
                disabled={deleteListing.isPending}
                type="button"
              >
                Устгах
              </button>
            </div>
          )}

          {formError && <p className="text-sm text-red-600">{formError}</p>}
        </div>
      </div>

      <div className="rounded-xl border bg-white p-4">
        <h2 className="mb-3 text-lg font-semibold">Зарын эзэн</h2>
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 overflow-hidden rounded-full bg-gray-200">
            {authorAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={authorAvatar} alt={authorName} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-gray-600">
                {authorName
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
            )}
          </div>
          <div className="space-y-1 text-sm text-gray-700">
            <div>{authorName}</div>
            {author?.email && <div>{author.email}</div>}
            {author?.phone && <div>{author.phone}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
