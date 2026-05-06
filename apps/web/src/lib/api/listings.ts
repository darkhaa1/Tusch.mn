import { cache } from "react";
import { apiFetch, serverApiBaseUrl } from "./base";
import type { Listing, ListingsPage } from "./types";

export type ListingServerData = {
  id: string;
  description?: string;
  category?: string;
  price?: number;
  location?: string;
  images?: { url?: string }[];
  user?: { firstName?: string; lastName?: string };
};

async function _getListingByIdServer(
  id: string,
): Promise<ListingServerData | null> {
  try {
    const res = await fetch(`${serverApiBaseUrl}/listings/${id}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json() as Promise<ListingServerData>;
  } catch {
    return null;
  }
}

export const getListingByIdServer = cache(_getListingByIdServer);

async function _fetchListingsByCategory(
  categorySlug: string,
): Promise<Listing[]> {
  try {
    const res = await fetch(
      `${serverApiBaseUrl}/listings?category=${encodeURIComponent(categorySlug)}&limit=20&sort=newest`,
      { next: { revalidate: 86400 } },
    );
    if (!res.ok) return [];
    const data = (await res.json()) as ListingsPage;
    return data.items ?? [];
  } catch {
    return [];
  }
}

export const fetchListingsByCategory = cache(_fetchListingsByCategory);

async function _fetchListingsByLocation(cityName: string): Promise<Listing[]> {
  try {
    const res = await fetch(
      `${serverApiBaseUrl}/listings?location=${encodeURIComponent(cityName)}&limit=20&sort=newest`,
      { next: { revalidate: 86400 } },
    );
    if (!res.ok) return [];
    const data = (await res.json()) as ListingsPage;
    return data.items ?? [];
  } catch {
    return [];
  }
}

export const fetchListingsByLocation = cache(_fetchListingsByLocation);

export async function fetchListings(params?: {
  category?: string;
}): Promise<Listing[]> {
  const searchParams = new URLSearchParams();
  if (params?.category) {
    searchParams.set("category", params.category);
  }
  const query = searchParams.toString();
  const path = query ? `/listings?${query}` : "/listings";
  const data = await apiFetch<{ items: Listing[] }>(path, { method: "GET" });
  return data.items;
}

export async function fetchListingsPage(params?: {
  category?: string;
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
}): Promise<ListingsPage> {
  const searchParams = new URLSearchParams();
  if (params?.category) searchParams.set("category", params.category);
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));
  if (params?.sort) searchParams.set("sort", params.sort);
  if (params?.search) searchParams.set("search", params.search);
  if (params?.minPrice !== undefined) searchParams.set("minPrice", String(params.minPrice));
  if (params?.maxPrice !== undefined) searchParams.set("maxPrice", String(params.maxPrice));
  if (params?.location) searchParams.set("location", params.location);
  const query = searchParams.toString();
  const path = query ? `/listings?${query}` : "/listings";

  return apiFetch<ListingsPage>(path, { method: "GET" });
}

export async function fetchMyListings(): Promise<Listing[]> {
  return apiFetch<Listing[]>("/listings/me", { method: "GET" });
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

export async function reorderListingImages(
  listingId: string,
  imageIds: string[],
) {
  return apiFetch(`/listings/${listingId}/images/reorder`, {
    method: "PATCH",
    body: JSON.stringify({ imageIds }),
  });
}

export async function fetchListingLocations(): Promise<string[]> {
  return apiFetch<string[]>("/listings/locations", { method: "GET" });
}
