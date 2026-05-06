import { cache } from "react";
import { apiFetch, serverApiBaseUrl } from "./base";

export type UserServerData = {
  user: {
    id: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
  };
};

async function _getUserPublicProfileServer(
  id: string,
): Promise<UserServerData | null> {
  try {
    const res = await fetch(`${serverApiBaseUrl}/users/${id}/public`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json() as Promise<UserServerData>;
  } catch {
    return null;
  }
}

export const getUserPublicProfileServer = cache(_getUserPublicProfileServer);
import type {
  CurrentUser,
  ProvidersPage,
  PublicUserProfile,
  ServiceZone,
  UsersPage,
} from "./types";
import type { UserRole } from "@repo/shared";

export async function completeOnboarding(body: {
  role?: UserRole;
  city?: string;
  bio?: string;
  serviceCategories?: string[];
  serviceZones?: string[];
}): Promise<{ user: CurrentUser }> {
  return apiFetch<{ user: CurrentUser }>("/users/onboarding", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function fetchUsers(params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<UsersPage> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));
  if (params?.search) searchParams.set("search", params.search);
  const query = searchParams.toString();
  const path = query ? `/users?${query}` : "/users";
  return apiFetch<UsersPage>(path, { method: "GET" });
}

export async function fetchProviders(params?: {
  q?: string;
  category?: string;
  city?: string;
  verified?: boolean;
  page?: number;
  limit?: number;
}): Promise<ProvidersPage> {
  const searchParams = new URLSearchParams();
  if (params?.q) searchParams.set("q", params.q);
  if (params?.category) searchParams.set("category", params.category);
  if (params?.city) searchParams.set("city", params.city);
  if (params?.verified) searchParams.set("verified", "true");
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));
  const query = searchParams.toString();
  const path = query ? `/users/providers?${query}` : "/users/providers";
  return apiFetch<ProvidersPage>(path, { method: "GET" });
}

export async function fetchServiceZones(userId: string): Promise<ServiceZone[]> {
  return apiFetch<ServiceZone[]>(`/users/${userId}/service-zones`, { method: "GET" });
}

export async function updateServiceZones(
  zones: { city: string; district?: string }[]
): Promise<ServiceZone[]> {
  return apiFetch<ServiceZone[]>("/users/service-zones", {
    method: "PUT",
    body: JSON.stringify({ zones }),
  });
}

export async function fetchPublicUserProfile(
  userId: string,
  params?: { page?: number; limit?: number }
) {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));
  const query = searchParams.toString();
  const path = query
    ? `/users/${userId}/public?${query}`
    : `/users/${userId}/public`;
  return apiFetch<PublicUserProfile>(path, { method: "GET" });
}
