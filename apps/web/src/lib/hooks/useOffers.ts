"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  acceptOffer,
  cancelOffer,
  completeOffer,
  createOffer,
  getOffer,
  getOffersByListing,
  getOffersHistory,
  getOffersHistoryAsClient,
  getOffersHistoryAsProvider,
  getOffersReceived,
  getOffersSent,
  getOffersStats,
  rejectOffer,
} from "@web/lib/api/offers";
import type { OffersStats } from "@web/lib/api/offers";
import type { Offer, OffersPage } from "@web/lib/api/types";
import { useCurrentUser } from "./useAuth";

export function useOffersSent(params?: { page?: number; limit?: number }) {
  const { data: user } = useCurrentUser();
  return useQuery<OffersPage>({
    queryKey: ["offers-sent", params?.page || 1, params?.limit || 10],
    queryFn: () => getOffersSent(params),
    enabled: !!user,
  });
}

export function useOffersReceived(params?: { page?: number; limit?: number }) {
  const { data: user } = useCurrentUser();
  return useQuery<OffersPage>({
    queryKey: ["offers-received", params?.page || 1, params?.limit || 10],
    queryFn: () => getOffersReceived(params),
    enabled: !!user,
  });
}

export function useOffer(offerId?: string) {
  return useQuery<Offer>({
    queryKey: ["offer", offerId],
    queryFn: () => getOffer(offerId as string),
    enabled: !!offerId,
  });
}

export function useOffersByListing(listingId?: string, enabled = true) {
  return useQuery<Offer[]>({
    queryKey: ["offers-by-listing", listingId],
    queryFn: () => getOffersByListing(listingId as string),
    enabled: Boolean(listingId) && enabled,
  });
}

export function useOffersPendingCount(limit = 50) {
  const { data: user } = useCurrentUser();
  return useQuery<{ count: number; isTruncated: boolean }>({
    queryKey: ["offers-received-pending-count", limit],
    queryFn: async () => {
      const data = await getOffersReceived({ page: 1, limit });
      const pendingCount = data.items.filter(
        (offer) => offer.status === "PENDING",
      ).length;
      const isTruncated =
        data.total > data.limit && pendingCount === data.items.length;
      return { count: pendingCount, isTruncated };
    },
    enabled: !!user,
    refetchInterval: 30_000,
    staleTime: 10_000,
  });
}

export function useCreateOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      listingId,
      data,
    }: {
      listingId: string;
      data: Parameters<typeof createOffer>[1];
    }) => createOffer(listingId, data),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ["offers-sent"] });
      queryClient.invalidateQueries({
        queryKey: ["offers-by-listing", variables.listingId],
      });
    },
  });
}

export function useAcceptOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ offerId }: { offerId: string }) => acceptOffer(offerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offers-received"] });
      queryClient.invalidateQueries({
        queryKey: ["offers-received-pending-count"],
      });
      queryClient.invalidateQueries({ queryKey: ["offers-by-listing"] });
      queryClient.invalidateQueries({ queryKey: ["offers-sent"] });
      queryClient.invalidateQueries({ queryKey: ["message-threads"] });
      queryClient.invalidateQueries({ queryKey: ["conversation"] });
    },
  });
}

export function useRejectOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ offerId }: { offerId: string }) => rejectOffer(offerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offers-received"] });
      queryClient.invalidateQueries({
        queryKey: ["offers-received-pending-count"],
      });
      queryClient.invalidateQueries({ queryKey: ["offers-by-listing"] });
      queryClient.invalidateQueries({ queryKey: ["offers-sent"] });
    },
  });
}

export function useCancelOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ offerId }: { offerId: string }) => cancelOffer(offerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offers-received"] });
      queryClient.invalidateQueries({ queryKey: ["offers-by-listing"] });
      queryClient.invalidateQueries({ queryKey: ["offers-sent"] });
    },
  });
}

export function useCompleteOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      offerId,
      clientNote,
    }: {
      offerId: string;
      clientNote?: string;
    }) => completeOffer(offerId, clientNote),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offers-received"] });
      queryClient.invalidateQueries({ queryKey: ["offers-sent"] });
      queryClient.invalidateQueries({ queryKey: ["offers-history"] });
      queryClient.invalidateQueries({ queryKey: ["offers-stats"] });
    },
  });
}

export function useOffersHistory(params?: { page?: number; limit?: number }) {
  const { data: user } = useCurrentUser();
  return useQuery<OffersPage>({
    queryKey: ["offers-history", params?.page || 1, params?.limit || 10],
    queryFn: () => getOffersHistory(params),
    enabled: !!user,
  });
}

export function useOffersHistoryAsClient(params?: {
  page?: number;
  limit?: number;
}) {
  const { data: user } = useCurrentUser();
  return useQuery<OffersPage>({
    queryKey: [
      "offers-history-client",
      params?.page || 1,
      params?.limit || 10,
    ],
    queryFn: () => getOffersHistoryAsClient(params),
    enabled: !!user,
  });
}

export function useOffersHistoryAsProvider(params?: {
  page?: number;
  limit?: number;
}) {
  const { data: user } = useCurrentUser();
  return useQuery<OffersPage>({
    queryKey: [
      "offers-history-provider",
      params?.page || 1,
      params?.limit || 10,
    ],
    queryFn: () => getOffersHistoryAsProvider(params),
    enabled: !!user,
  });
}

export function useOffersStats() {
  const { data: user } = useCurrentUser();
  return useQuery<OffersStats>({
    queryKey: ["offers-stats"],
    queryFn: getOffersStats,
    enabled: !!user,
  });
}
