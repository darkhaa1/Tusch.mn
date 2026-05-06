"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchProviders,
  fetchPublicUserProfile,
  fetchServiceZones,
  fetchUsers,
  updateServiceZones,
} from "@web/lib/api/users";
import type { ProvidersPage, UsersPage } from "@web/lib/api/types";

export function useUsers(
  params?: { page?: number; limit?: number; search?: string },
  enabled = true,
) {
  return useQuery<UsersPage>({
    queryKey: [
      "users",
      params?.page || 1,
      params?.limit || 20,
      params?.search || "",
    ],
    queryFn: () => fetchUsers(params),
    enabled,
  });
}

export function useProviders(params?: {
  q?: string;
  category?: string;
  city?: string;
  verified?: boolean;
  page?: number;
  limit?: number;
}) {
  return useQuery<ProvidersPage>({
    queryKey: [
      "providers",
      params?.q || "",
      params?.category || "all",
      params?.city || "",
      params?.verified ?? false,
      params?.page || 1,
      params?.limit || 12,
    ],
    queryFn: () => fetchProviders(params),
  });
}

export function useServiceZones(userId?: string) {
  return useQuery({
    queryKey: ["service-zones", userId],
    queryFn: () => fetchServiceZones(userId as string),
    enabled: !!userId,
  });
}

export function useUpdateServiceZones() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (zones: { city: string; district?: string }[]) =>
      updateServiceZones(zones),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-zones"] });
    },
  });
}

export function usePublicUserProfile(userId?: string) {
  return useQuery({
    queryKey: ["public-user-profile", userId],
    queryFn: () => fetchPublicUserProfile(userId as string),
    enabled: !!userId,
  });
}
