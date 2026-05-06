"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchAdminListings,
  fetchAdminStats,
  fetchAdminUsers,
  fetchAdminVerifications,
  restoreAdminListing,
  restoreAdminUser,
  updateAdminListingStatus,
  updateAdminUserStatus,
  updateAdminVerification,
} from "@web/lib/api/admin";
import {
  createReport,
  fetchAdminReports,
  updateAdminReportStatus,
} from "@web/lib/api/reports";
import type {
  AdminListingsPage,
  AdminReportsPage,
  AdminStats,
  AdminUsersPage,
  AdminVerificationsPage,
  ListingStatus,
  ReportStatus,
  ReportTargetType,
  UserStatus,
} from "@web/lib/api/types";

export function useAdminStats() {
  return useQuery<AdminStats>({
    queryKey: ["admin-stats"],
    queryFn: fetchAdminStats,
  });
}

export function useAdminReports(params?: {
  status?: ReportStatus;
  targetType?: ReportTargetType;
  page?: number;
  limit?: number;
}) {
  return useQuery<AdminReportsPage>({
    queryKey: [
      "admin-reports",
      params?.status || "all",
      params?.targetType || "all",
      params?.page || 1,
      params?.limit || 20,
    ],
    queryFn: () => fetchAdminReports(params),
  });
}

export function useUpdateAdminReportStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      reportId,
      status,
    }: {
      reportId: string;
      status: Extract<ReportStatus, "REVIEWED" | "DISMISSED">;
    }) => updateAdminReportStatus(reportId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
    },
  });
}

export function useAdminUsers(params?: {
  q?: string;
  status?: UserStatus;
  includeDeleted?: boolean;
  page?: number;
  limit?: number;
}) {
  return useQuery<AdminUsersPage>({
    queryKey: [
      "admin-users",
      params?.q || "",
      params?.status || "all",
      params?.includeDeleted ? "with-deleted" : "without-deleted",
      params?.page || 1,
      params?.limit || 20,
    ],
    queryFn: () => fetchAdminUsers(params),
  });
}

export function useUpdateAdminUserStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      status,
    }: {
      userId: string;
      status: UserStatus;
    }) => updateAdminUserStatus(userId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });
}

export function useAdminListings(params?: {
  q?: string;
  status?: ListingStatus;
  includeDeleted?: boolean;
  category?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery<AdminListingsPage>({
    queryKey: [
      "admin-listings",
      params?.q || "",
      params?.status || "all",
      params?.includeDeleted ? "with-deleted" : "without-deleted",
      params?.category || "all",
      params?.page || 1,
      params?.limit || 20,
    ],
    queryFn: () => fetchAdminListings(params),
  });
}

export function useUpdateAdminListingStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      listingId,
      status,
    }: {
      listingId: string;
      status: ListingStatus;
    }) => updateAdminListingStatus(listingId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-listings"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });
}

export function useRestoreAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId }: { userId: string }) => restoreAdminUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });
}

export function useRestoreAdminListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ listingId }: { listingId: string }) =>
      restoreAdminListing(listingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-listings"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      queryClient.invalidateQueries({ queryKey: ["listings"] });
    },
  });
}

export function useCreateReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
    },
  });
}

export function useAdminVerifications(params?: {
  page?: number;
  limit?: number;
}) {
  return useQuery<AdminVerificationsPage>({
    queryKey: [
      "admin-verifications",
      params?.page || 1,
      params?.limit || 20,
    ],
    queryFn: () => fetchAdminVerifications(params),
  });
}

export function useUpdateAdminVerification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      action,
      reason,
    }: {
      userId: string;
      action: "APPROVE" | "REJECT";
      reason?: string;
    }) => updateAdminVerification(userId, action, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-verifications"] });
    },
  });
}
