import { apiFetch } from "./base";
import type { Listing, ListingsPage } from "./types";

export async function fetchListings(params?: {
  category?: string;
}): Promise<Listing[]> {
  const searchParams = new URLSearchParams();
  if (params?.category) {
    searchParams.set("category", params.category);
  }
  const query = searchParams.toString();
  const path = query ? `/listings?${query}` : "/listings";
  const data = await apiFetch<
    { items?: Listing[]; data?: Listing[] } | Listing[]
  >(path, { method: "GET" });
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.items)) return data.items;
  return data.data || [];
}

export async function fetchListingsPage(params?: {
  category?: string;
  page?: number;
  limit?: number;
  sort?: string;
}): Promise<ListingsPage> {
  const searchParams = new URLSearchParams();
  if (params?.category) searchParams.set("category", params.category);
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));
  if (params?.sort) searchParams.set("sort", params.sort);
  const query = searchParams.toString();
  const path = query ? `/listings?${query}` : "/listings";

  const data = await apiFetch<
    | Listing[]
    | {
        items?: Listing[];
        total?: number;
        page?: number;
        limit?: number;
        data?: Listing[];
      }
  >(path, { method: "GET" });

  const fallbackPage = params?.page ?? 1;
  const fallbackLimit = params?.limit ?? 12;

  if (Array.isArray(data)) {
    const start = (fallbackPage - 1) * fallbackLimit;
    const items = data.slice(start, start + fallbackLimit);
    return {
      items,
      total: data.length,
      page: fallbackPage,
      limit: fallbackLimit,
    };
  }

  const items = Array.isArray(data.items) ? data.items : data.data || [];

  return {
    items,
    total: data.total ?? items.length,
    page: data.page ?? fallbackPage,
    limit: data.limit ?? fallbackLimit,
  };
}

export async function fetchMyListings(): Promise<Listing[]> {
  const data = await apiFetch<{ data?: Listing[] } | Listing[]>(
    "/listings/me",
    { method: "GET" }
  );
  if (Array.isArray(data)) return data;
  return data.data || [];
}

export async function fetchListingById(id: string): Promise<Listing> {
  return apiFetch(`/listings/${id}`, { method: "GET" });
}

export async function createListing(body: {
  description: string;
  price: number;
  location?: string;
  category?: string;
}) {
  return apiFetch("/listings", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateListing(
  id: string,
  body: {
    description?: string;
    price?: number;
    location?: string;
    category?: string;
  }
) {
  return apiFetch(`/listings/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function deleteListing(id: string) {
  return apiFetch(`/listings/${id}`, {
    method: "DELETE",
  });
}

export async function uploadListingImages(listingId: string, files: File[]) {
  if (!files.length) return;
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  return apiFetch(`/listings/${listingId}/images`, {
    method: "POST",
    body: formData,
  });
}

export async function deleteListingImage(listingId: string, imageId: string) {
  return apiFetch(`/listings/${listingId}/images/${imageId}`, {
    method: "DELETE",
  });
}
