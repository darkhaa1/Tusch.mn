import { apiFetch } from "./base";
import type { Offer, OffersPage } from "./types";

type OffersQuery = {
  page?: number;
  limit?: number;
};

type CreateOfferPayload = {
  price: number;
  message: string;
  estimatedDays?: number;
};

function buildOffersQuery(params?: OffersQuery) {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));
  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

function normalizeOffersPage(
  data: OffersPage | Offer[] | { items?: Offer[]; total?: number; page?: number; limit?: number },
  fallbackPage: number,
  fallbackLimit: number
): OffersPage {
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

  const items = Array.isArray(data.items) ? data.items : [];
  return {
    items,
    total: data.total ?? items.length,
    page: data.page ?? fallbackPage,
    limit: data.limit ?? fallbackLimit,
  };
}

export async function createOffer(listingId: string, data: CreateOfferPayload) {
  return apiFetch<Offer>(`/offers/listing/${listingId}`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getOffersSent(params?: OffersQuery): Promise<OffersPage> {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 12;
  const data = await apiFetch<OffersPage | Offer[]>(
    `/offers/sent${buildOffersQuery({ page, limit })}`,
    { method: "GET" }
  );

  return normalizeOffersPage(data, page, limit);
}

export async function getOffersReceived(params?: OffersQuery): Promise<OffersPage> {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 12;
  const data = await apiFetch<OffersPage | Offer[]>(
    `/offers/received${buildOffersQuery({ page, limit })}`,
    { method: "GET" }
  );

  return normalizeOffersPage(data, page, limit);
}

export async function getOffer(id: string): Promise<Offer> {
  return apiFetch<Offer>(`/offers/${id}`, { method: "GET" });
}

export async function getOffersByListing(listingId: string): Promise<Offer[]> {
  return apiFetch<Offer[]>(`/offers/listing/${listingId}`, { method: "GET" });
}

export async function acceptOffer(id: string) {
  return apiFetch<Offer>(`/offers/${id}/accept`, { method: "PATCH" });
}

export async function rejectOffer(id: string) {
  return apiFetch<Offer>(`/offers/${id}/reject`, { method: "PATCH" });
}

export async function cancelOffer(id: string) {
  return apiFetch<Offer>(`/offers/${id}/cancel`, { method: "PATCH" });
}

export async function completeOffer(id: string, clientNote?: string) {
  return apiFetch<Offer>(`/offers/${id}/complete`, {
    method: "PATCH",
    body: JSON.stringify({ clientNote }),
  });
}

export async function getOffersHistory(params?: OffersQuery): Promise<OffersPage> {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 12;
  const data = await apiFetch<OffersPage | Offer[]>(
    `/offers/history${buildOffersQuery({ page, limit })}`,
    { method: "GET" }
  );
  return normalizeOffersPage(data, page, limit);
}

export async function getOffersHistoryAsClient(params?: OffersQuery): Promise<OffersPage> {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 12;
  const data = await apiFetch<OffersPage | Offer[]>(
    `/offers/history/as-client${buildOffersQuery({ page, limit })}`,
    { method: "GET" }
  );
  return normalizeOffersPage(data, page, limit);
}

export async function getOffersHistoryAsProvider(params?: OffersQuery): Promise<OffersPage> {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 12;
  const data = await apiFetch<OffersPage | Offer[]>(
    `/offers/history/as-provider${buildOffersQuery({ page, limit })}`,
    { method: "GET" }
  );
  return normalizeOffersPage(data, page, limit);
}

export type OffersStats = {
  totalCompleted: number;
  totalSpentAsClient: number | null;
  totalEarnedAsProvider: number | null;
  averagePriceAsClient: number | null;
  averagePriceAsProvider: number | null;
};

export async function getOffersStats(): Promise<OffersStats> {
  return apiFetch<OffersStats>("/offers/stats", { method: "GET" });
}