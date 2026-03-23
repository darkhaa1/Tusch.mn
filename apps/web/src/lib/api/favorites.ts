import { apiFetch } from "./base";
import type { Listing, ProviderCard, ListingsPage, ProvidersPage } from "./types";

export async function addFavoriteListing(listingId: string): Promise<void> {
  await apiFetch(`/favorites/listings/${listingId}`, { method: "POST" });
}

export async function removeFavoriteListing(listingId: string): Promise<void> {
  await apiFetch(`/favorites/listings/${listingId}`, { method: "DELETE" });
}

export async function fetchFavoriteListings(params?: {
  page?: number;
  limit?: number;
}): Promise<ListingsPage> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));
  const query = searchParams.toString();
  const path = query ? `/favorites/listings?${query}` : "/favorites/listings";
  return apiFetch<ListingsPage>(path, { method: "GET" });
}

export async function fetchFavoriteListingIds(): Promise<string[]> {
  const data = await fetchFavoriteListings({ limit: 200 });
  return (data.items as Listing[]).map((item) => item.id);
}

export async function addFavoriteProvider(providerId: string): Promise<void> {
  await apiFetch(`/favorites/providers/${providerId}`, { method: "POST" });
}

export async function removeFavoriteProvider(providerId: string): Promise<void> {
  await apiFetch(`/favorites/providers/${providerId}`, { method: "DELETE" });
}

export async function fetchFavoriteProviders(params?: {
  page?: number;
  limit?: number;
}): Promise<ProvidersPage> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));
  const query = searchParams.toString();
  const path = query ? `/favorites/providers?${query}` : "/favorites/providers";
  return apiFetch<ProvidersPage>(path, { method: "GET" });
}

export async function fetchFavoriteProviderIds(): Promise<string[]> {
  const data = await fetchFavoriteProviders({ limit: 200 });
  return (data.items as ProviderCard[]).map((item) => item.id);
}
