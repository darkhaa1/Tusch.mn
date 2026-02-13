import { apiFetch } from "./base";
import type {
  AdminListingsPage,
  AdminStats,
  AdminUsersPage,
  ListingStatus,
  UserStatus,
} from "./types";

export async function fetchAdminStats(): Promise<AdminStats> {
  return apiFetch<AdminStats>("/admin/stats", { method: "GET" });
}

export async function fetchAdminUsers(params?: {
  q?: string;
  status?: UserStatus;
  includeDeleted?: boolean;
  page?: number;
  limit?: number;
}): Promise<AdminUsersPage> {
  const searchParams = new URLSearchParams();
  if (params?.q) searchParams.set("q", params.q);
  if (params?.status) searchParams.set("status", params.status);
  if (params?.includeDeleted) searchParams.set("includeDeleted", "true");
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));
  const query = searchParams.toString();
  const path = query ? `/admin/users?${query}` : "/admin/users";
  return apiFetch<AdminUsersPage>(path, { method: "GET" });
}

export async function updateAdminUserStatus(userId: string, status: UserStatus) {
  return apiFetch(`/admin/users/${userId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function restoreAdminUser(userId: string) {
  return apiFetch(`/admin/users/${userId}/restore`, {
    method: "PATCH",
  });
}

export async function fetchAdminListings(params?: {
  q?: string;
  status?: ListingStatus;
  includeDeleted?: boolean;
  category?: string;
  page?: number;
  limit?: number;
}): Promise<AdminListingsPage> {
  const searchParams = new URLSearchParams();
  if (params?.q) searchParams.set("q", params.q);
  if (params?.status) searchParams.set("status", params.status);
  if (params?.includeDeleted) searchParams.set("includeDeleted", "true");
  if (params?.category) searchParams.set("category", params.category);
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));
  const query = searchParams.toString();
  const path = query ? `/admin/listings?${query}` : "/admin/listings";
  return apiFetch<AdminListingsPage>(path, { method: "GET" });
}

export async function updateAdminListingStatus(
  listingId: string,
  status: ListingStatus
) {
  return apiFetch(`/admin/listings/${listingId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function restoreAdminListing(listingId: string) {
  return apiFetch(`/admin/listings/${listingId}/restore`, {
    method: "PATCH",
  });
}
