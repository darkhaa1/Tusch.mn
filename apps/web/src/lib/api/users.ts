import { apiFetch } from "./base";
import type {
  CurrentUser,
  ProvidersPage,
  PublicUserProfile,
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
  page?: number;
  limit?: number;
}): Promise<ProvidersPage> {
  const searchParams = new URLSearchParams();
  if (params?.q) searchParams.set("q", params.q);
  if (params?.category) searchParams.set("category", params.category);
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));
  const query = searchParams.toString();
  const path = query ? `/users/providers?${query}` : "/users/providers";
  return apiFetch<ProvidersPage>(path, { method: "GET" });
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
