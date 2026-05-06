"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addFavoriteListing,
  addFavoriteProvider,
  fetchFavoriteListingIds,
  fetchFavoriteListings,
  fetchFavoriteProviderIds,
  fetchFavoriteProviders,
  removeFavoriteListing,
  removeFavoriteProvider,
} from "@web/lib/api/favorites";
import type { ListingsPage, ProvidersPage } from "@web/lib/api/types";
import { useCurrentUser } from "./useAuth";

export function useFavoriteListingIds() {
  const { data: user } = useCurrentUser();
  return useQuery<string[]>({
    queryKey: ["favorite-listing-ids"],
    queryFn: fetchFavoriteListingIds,
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    placeholderData: [],
  });
}

export function useFavoriteListings(params?: {
  page?: number;
  limit?: number;
}) {
  const { data: user } = useCurrentUser();
  return useQuery<ListingsPage>({
    queryKey: [
      "favorite-listings",
      params?.page || 1,
      params?.limit || 12,
    ],
    queryFn: () => fetchFavoriteListings(params),
    enabled: !!user,
  });
}

export function useToggleFavoriteListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      listingId,
      isFavorited,
    }: {
      listingId: string;
      isFavorited: boolean;
    }) =>
      isFavorited
        ? removeFavoriteListing(listingId)
        : addFavoriteListing(listingId),
    onMutate: async ({ listingId, isFavorited }) => {
      await queryClient.cancelQueries({
        queryKey: ["favorite-listing-ids"],
      });
      const previous = queryClient.getQueryData<string[]>([
        "favorite-listing-ids",
      ]);
      queryClient.setQueryData<string[]>(
        ["favorite-listing-ids"],
        (old = []) =>
          isFavorited
            ? old.filter((id) => id !== listingId)
            : [...old, listingId],
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(
          ["favorite-listing-ids"],
          context.previous,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["favorite-listings"] });
    },
  });
}

export function useFavoriteProviderIds() {
  const { data: user } = useCurrentUser();
  return useQuery<string[]>({
    queryKey: ["favorite-provider-ids"],
    queryFn: fetchFavoriteProviderIds,
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    placeholderData: [],
  });
}

export function useFavoriteProviders(params?: {
  page?: number;
  limit?: number;
}) {
  const { data: user } = useCurrentUser();
  return useQuery<ProvidersPage>({
    queryKey: [
      "favorite-providers",
      params?.page || 1,
      params?.limit || 12,
    ],
    queryFn: () => fetchFavoriteProviders(params),
    enabled: !!user,
  });
}

export function useToggleFavoriteProvider() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      providerId,
      isFavorited,
    }: {
      providerId: string;
      isFavorited: boolean;
    }) =>
      isFavorited
        ? removeFavoriteProvider(providerId)
        : addFavoriteProvider(providerId),
    onMutate: async ({ providerId, isFavorited }) => {
      await queryClient.cancelQueries({
        queryKey: ["favorite-provider-ids"],
      });
      const previous = queryClient.getQueryData<string[]>([
        "favorite-provider-ids",
      ]);
      queryClient.setQueryData<string[]>(
        ["favorite-provider-ids"],
        (old = []) =>
          isFavorited
            ? old.filter((id) => id !== providerId)
            : [...old, providerId],
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(
          ["favorite-provider-ids"],
          context.previous,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["favorite-providers"] });
    },
  });
}

export function useFavoritesCount() {
  const { data: listingIds = [] } = useFavoriteListingIds();
  const { data: providerIds = [] } = useFavoriteProviderIds();
  return listingIds.length + providerIds.length;
}
