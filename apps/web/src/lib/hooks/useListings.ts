"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createListing,
  deleteListing,
  fetchListingById,
  fetchListingLocations,
  fetchListings,
  fetchListingsPage,
  fetchMyListings,
  reorderListingImages,
  updateListing,
} from "@web/lib/api/listings";
import type { Listing, ListingsPage } from "@web/lib/api/types";

export function useListings(category?: string) {
  return useQuery<Listing[]>({
    queryKey: ["listings", category || "all"],
    queryFn: () => fetchListings({ category }),
  });
}

export function useListingsPage(params?: {
  category?: string;
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
}) {
  return useQuery<ListingsPage>({
    queryKey: [
      "listings",
      params?.category || "all",
      params?.page || 1,
      params?.limit || 12,
      params?.sort || "newest",
      params?.search || "",
      params?.minPrice ?? "any",
      params?.maxPrice ?? "any",
      params?.location || "all",
    ],
    queryFn: () => fetchListingsPage(params),
  });
}

export function useListingLocations() {
  return useQuery<string[]>({
    queryKey: ["listing-locations"],
    queryFn: fetchListingLocations,
    staleTime: 5 * 60 * 1000,
  });
}

export function useListing(id?: string) {
  return useQuery({
    queryKey: ["listing", id],
    queryFn: () => fetchListingById(id as string),
    enabled: !!id,
  });
}

export function useMyListings() {
  return useQuery<Listing[]>({
    queryKey: ["my-listings"],
    queryFn: fetchMyListings,
  });
}

export function useCreateListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createListing,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.invalidateQueries({ queryKey: ["my-listings"] });
    },
  });
}

export function useUpdateListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof updateListing>[1];
    }) => updateListing(id, data),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ["listing", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.invalidateQueries({ queryKey: ["my-listings"] });
    },
  });
}

export function useDeleteListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteListing,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.invalidateQueries({ queryKey: ["my-listings"] });
    },
  });
}

export function useReorderListingImages() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      listingId,
      imageIds,
    }: {
      listingId: string;
      imageIds: string[];
    }) => reorderListingImages(listingId, imageIds),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["listing", variables.listingId],
      });
    },
  });
}
