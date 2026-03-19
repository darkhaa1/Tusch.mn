import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AdminListingsPage,
  AdminReportsPage,
  AdminStats,
  AdminUsersPage,
  ConversationPage,
  Listing,
  ListingStatus,
  ListingsPage,
  Message,
  NotificationsPage,
  Offer,
  OffersPage,
  ProvidersPage,
  ReportStatus,
  ReportTargetType,
  ReviewsPage,
  UserStatus,
  UsersPage,
} from "@web/lib/api/types";
import {
  changePassword,
  deleteCurrentUser,
  forgotPassword,
  getCurrentUser,
  loginUser,
  logoutUser,
  oauthLogin,
  registerUser,
  resendVerification,
  resetPassword,
  updateCurrentUser,
  updateMyRole,
  verifyEmail,
} from "@web/lib/api/auth";
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
import {
  completeOnboarding,
  fetchProviders,
  fetchPublicUserProfile,
  fetchUsers,
} from "@web/lib/api/users";
import {
  fetchConversationWith,
  fetchMessageThreads,
  fetchUnreadCount,
  markMessageRead,
  sendMessage,
} from "@web/lib/api/messages";
import {
  fetchAdminListings,
  fetchAdminStats,
  fetchAdminUsers,
  restoreAdminListing,
  restoreAdminUser,
  updateAdminListingStatus,
  updateAdminUserStatus,
} from "@web/lib/api/admin";
import {
  createReview,
  deleteReview,
  fetchUserReviews,
} from "@web/lib/api/reviews";
import {
  createReport,
  fetchAdminReports,
  updateAdminReportStatus,
} from "@web/lib/api/reports";
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@web/lib/api/notifications";
import {
  acceptOffer,
  cancelOffer,
  completeOffer,
  createOffer,
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

export function useCurrentUser() {
  return useQuery({
    queryKey: ['current-user'],
    queryFn: getCurrentUser,
    staleTime: 1000 * 60 * 5,
  });
}

export function useListings(category?: string) {
  return useQuery<Listing[]>({
    queryKey: ['listings', category || 'all'],
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
      'listings',
      params?.category || 'all',
      params?.page || 1,
      params?.limit || 12,
      params?.sort || 'newest',
      params?.search || '',
      params?.minPrice ?? 'any',
      params?.maxPrice ?? 'any',
      params?.location || 'all',
    ],
    queryFn: () => fetchListingsPage(params),
  });
}

export function useListingLocations() {
  return useQuery<string[]>({
    queryKey: ['listing-locations'],
    queryFn: fetchListingLocations,
    staleTime: 5 * 60 * 1000,
  });
}

export function useListing(id?: string) {
  return useQuery({
    queryKey: ['listing', id],
    queryFn: () => fetchListingById(id as string),
    enabled: !!id,
  });
}

export function useMyListings() {
  return useQuery<Listing[]>({
    queryKey: ['my-listings'],
    queryFn: fetchMyListings,
  });
}

export function useCreateListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createListing,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
    },
  });
}

export function useUpdateListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateListing>[1] }) =>
      updateListing(id, data),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['listing', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
    },
  });
}

export function useDeleteListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteListing,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
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
      queryClient.invalidateQueries({ queryKey: ['listing', variables.listingId] });
    },
  });
}

export function useRegisterUser() {
  return useMutation({
    mutationFn: registerUser,
  });
}

export function useLoginUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: loginUser,
    onSuccess: () => {
      // Refresh user data after email/password login sets the auth cookie
      queryClient.invalidateQueries({ queryKey: ['current-user'] });
    },
  });
}

export function useOauthLogin() {
  return useMutation({
    mutationFn: oauthLogin,
  });
}

export function useLogoutUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-user'] });
    },
  });
}

export function useUpdateCurrentUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateCurrentUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-user'] });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      changePassword(currentPassword, newPassword),
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => forgotPassword(email),
  });
}

export function useResetPassword() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ token, newPassword }: { token: string; newPassword: string }) =>
      resetPassword(token, newPassword),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-user'] });
    },
  });
}

export function useVerifyEmail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (token: string) => verifyEmail(token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-user'] });
    },
  });
}

export function useResendVerification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: resendVerification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-user'] });
    },
  });
}

export function useUpdateMyRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (role: Parameters<typeof updateMyRole>[0]) => updateMyRole(role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-user'] });
    },
  });
}

export function useDeleteCurrentUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCurrentUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-user'] });
    },
  });
}

export function useUsers(
  params?: { page?: number; limit?: number; search?: string },
  enabled = true,
) {
  return useQuery<UsersPage>({
    queryKey: ['users', params?.page || 1, params?.limit || 20, params?.search || ''],
    queryFn: () => fetchUsers(params),
    enabled,
  });
}

export function useProviders(params?: {
  q?: string;
  category?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery<ProvidersPage>({
    queryKey: [
      'providers',
      params?.q || '',
      params?.category || 'all',
      params?.page || 1,
      params?.limit || 12,
    ],
    queryFn: () => fetchProviders(params),
  });
}

export function useMessageThreads(enabled = true) {
  return useQuery<Message[]>({
    queryKey: ['message-threads'],
    queryFn: fetchMessageThreads,
    enabled,
  });
}

export function useConversation(userId?: string) {
  return useInfiniteQuery<ConversationPage>({
    queryKey: ['conversation', userId],
    queryFn: ({ pageParam }) =>
      fetchConversationWith(userId as string, pageParam as number),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.page + 1 : undefined,
    enabled: !!userId,
  });
}

export function useUnreadCount() {
  const { data: user } = useCurrentUser();
  return useQuery<{ count: number }>({
    queryKey: ['unread-count'],
    queryFn: fetchUnreadCount,
    enabled: !!user,
    refetchInterval: 30_000,
    staleTime: 10_000,
  });
}

export function useNotifications(params?: { page?: number; limit?: number }) {
  const { data: user } = useCurrentUser();
  return useQuery<NotificationsPage>({
    queryKey: ['notifications', params?.page || 1, params?.limit || 10],
    queryFn: () => fetchNotifications(params),
    enabled: !!user,
    refetchInterval: 30_000,
    staleTime: 10_000,
  });
}

export function useOffersSent(params?: { page?: number; limit?: number }) {
  const { data: user } = useCurrentUser();
  return useQuery<OffersPage>({
    queryKey: ['offers-sent', params?.page || 1, params?.limit || 10],
    queryFn: () => getOffersSent(params),
    enabled: !!user,
  });
}

export function useOffersReceived(params?: { page?: number; limit?: number }) {
  const { data: user } = useCurrentUser();
  return useQuery<OffersPage>({
    queryKey: ['offers-received', params?.page || 1, params?.limit || 10],
    queryFn: () => getOffersReceived(params),
    enabled: !!user,
  });
}

export function useOffersByListing(listingId?: string, enabled = true) {
  return useQuery<Offer[]>({
    queryKey: ['offers-by-listing', listingId],
    queryFn: () => getOffersByListing(listingId as string),
    enabled: Boolean(listingId) && enabled,
  });
}

export function useOffersPendingCount(limit = 50) {
  const { data: user } = useCurrentUser();
  return useQuery<{ count: number; isTruncated: boolean }>({
    queryKey: ['offers-received-pending-count', limit],
    queryFn: async () => {
      const data = await getOffersReceived({ page: 1, limit });
      const pendingCount = data.items.filter((offer) => offer.status === 'PENDING').length;
      const isTruncated = data.total > data.limit && pendingCount === data.items.length;
      return { count: pendingCount, isTruncated };
    },
    enabled: !!user,
    refetchInterval: 30_000,
    staleTime: 10_000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ notificationId }: { notificationId: string }) =>
      markNotificationRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkAllRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useCreateReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
    },
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sendMessage,
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['conversation', variables.recipientId] });
      queryClient.invalidateQueries({ queryKey: ['message-threads'] });
      queryClient.invalidateQueries({ queryKey: ['unread-count'] });
    },
  });
}

export function useMarkMessageRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ messageId }: { messageId: string; partnerId?: string }) => markMessageRead(messageId),
    onSuccess: (_result, variables) => {
      if (variables.partnerId) {
        queryClient.invalidateQueries({ queryKey: ['conversation', variables.partnerId] });
      }
      queryClient.invalidateQueries({ queryKey: ['message-threads'] });
      queryClient.invalidateQueries({ queryKey: ['unread-count'] });
    },
  });
}

export function usePublicUserProfile(userId?: string) {
  return useQuery({
    queryKey: ['public-user-profile', userId],
    queryFn: () => fetchPublicUserProfile(userId as string),
    enabled: !!userId,
  });
}

export function useAdminStats() {
  return useQuery<AdminStats>({
    queryKey: ['admin-stats'],
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
      'admin-reports',
      params?.status || 'all',
      params?.targetType || 'all',
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
      status: Extract<ReportStatus, 'REVIEWED' | 'DISMISSED'>;
    }) => updateAdminReportStatus(reportId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
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
      'admin-users',
      params?.q || '',
      params?.status || 'all',
      params?.includeDeleted ? 'with-deleted' : 'without-deleted',
      params?.page || 1,
      params?.limit || 20,
    ],
    queryFn: () => fetchAdminUsers(params),
  });
}

export function useUpdateAdminUserStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: UserStatus }) =>
      updateAdminUserStatus(userId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
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
      'admin-listings',
      params?.q || '',
      params?.status || 'all',
      params?.includeDeleted ? 'with-deleted' : 'without-deleted',
      params?.category || 'all',
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
      queryClient.invalidateQueries({ queryKey: ['admin-listings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
  });
}

export function useRestoreAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId }: { userId: string }) => restoreAdminUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
  });
}

export function useRestoreAdminListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ listingId }: { listingId: string }) =>
      restoreAdminListing(listingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-listings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
  });
}

export function useUserReviews(
  userId?: string,
  params?: { page?: number; limit?: number }
) {
  return useQuery<ReviewsPage>({
    queryKey: [
      'user-reviews',
      userId,
      params?.page || 1,
      params?.limit || 10,
    ],
    queryFn: () => fetchUserReviews(userId as string, params),
    enabled: !!userId,
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createReview,
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['user-reviews', variables.targetUserId],
      });
      queryClient.invalidateQueries({
        queryKey: ['public-user-profile', variables.targetUserId],
      });
    },
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reviewId, targetUserId }: { reviewId: string; targetUserId: string }) =>
      deleteReview(reviewId),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['user-reviews', variables.targetUserId],
      });
      queryClient.invalidateQueries({
        queryKey: ['public-user-profile', variables.targetUserId],
      });
    },
  });
}

export function useCreateOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ listingId, data }: { listingId: string; data: Parameters<typeof createOffer>[1] }) =>
      createOffer(listingId, data),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['offers-sent'] });
      queryClient.invalidateQueries({ queryKey: ['offers-by-listing', variables.listingId] });
    },
  });
}

export function useAcceptOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ offerId }: { offerId: string }) => acceptOffer(offerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers-received'] });
      queryClient.invalidateQueries({ queryKey: ['offers-received-pending-count'] });
      queryClient.invalidateQueries({ queryKey: ['offers-by-listing'] });
      queryClient.invalidateQueries({ queryKey: ['offers-sent'] });
      queryClient.invalidateQueries({ queryKey: ['message-threads'] });
      queryClient.invalidateQueries({ queryKey: ['conversation'] });
    },
  });
}

export function useRejectOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ offerId }: { offerId: string }) => rejectOffer(offerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers-received'] });
      queryClient.invalidateQueries({ queryKey: ['offers-received-pending-count'] });
      queryClient.invalidateQueries({ queryKey: ['offers-by-listing'] });
      queryClient.invalidateQueries({ queryKey: ['offers-sent'] });
    },
  });
}

export function useCancelOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ offerId }: { offerId: string }) => cancelOffer(offerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers-received'] });
      queryClient.invalidateQueries({ queryKey: ['offers-by-listing'] });
      queryClient.invalidateQueries({ queryKey: ['offers-sent'] });
    },
  });
}

export function useCompleteOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ offerId, clientNote }: { offerId: string; clientNote?: string }) =>
      completeOffer(offerId, clientNote),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers-received'] });
      queryClient.invalidateQueries({ queryKey: ['offers-sent'] });
      queryClient.invalidateQueries({ queryKey: ['offers-history'] });
      queryClient.invalidateQueries({ queryKey: ['offers-stats'] });
    },
  });
}

export function useOffersHistory(params?: { page?: number; limit?: number }) {
  const { data: user } = useCurrentUser();
  return useQuery<OffersPage>({
    queryKey: ['offers-history', params?.page || 1, params?.limit || 10],
    queryFn: () => getOffersHistory(params),
    enabled: !!user,
  });
}

export function useOffersHistoryAsClient(params?: { page?: number; limit?: number }) {
  const { data: user } = useCurrentUser();
  return useQuery<OffersPage>({
    queryKey: ['offers-history-client', params?.page || 1, params?.limit || 10],
    queryFn: () => getOffersHistoryAsClient(params),
    enabled: !!user,
  });
}

export function useOffersHistoryAsProvider(params?: { page?: number; limit?: number }) {
  const { data: user } = useCurrentUser();
  return useQuery<OffersPage>({
    queryKey: ['offers-history-provider', params?.page || 1, params?.limit || 10],
    queryFn: () => getOffersHistoryAsProvider(params),
    enabled: !!user,
  });
}

export function useCompleteOnboarding() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof completeOnboarding>[0]) =>
      completeOnboarding(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-user'] });
    },
  });
}

export function useOffersStats() {
  const { data: user } = useCurrentUser();
  return useQuery<OffersStats>({
    queryKey: ['offers-stats'],
    queryFn: getOffersStats,
    enabled: !!user,
  });
}
