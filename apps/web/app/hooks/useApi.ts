import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Listing,
  ListingsPage,
  Message,
  ProvidersPage,
  createListing,
  deleteCurrentUser,
  deleteListing,
  fetchConversationWith,
  fetchListingById,
  fetchListings,
  fetchListingsPage,
  fetchMessageThreads,
  fetchMyListings,
  fetchProviders,
  fetchUsers,
  getCurrentUser,
  loginUser,
  markMessageRead,
  logoutUser,
  oauthLogin,
  fetchPublicUserProfile,
  registerUser,
  sendMessage,
  updateCurrentUser,
  updateListing,
  uploadListingImages,
  updateMyRole,
  changePassword,
} from '../lib/api';

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
}) {
  return useQuery<ListingsPage>({
    queryKey: [
      'listings',
      params?.category || 'all',
      params?.page || 1,
      params?.limit || 12,
      params?.sort || 'newest',
    ],
    queryFn: () => fetchListingsPage(params),
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

export function useUsers(enabled = true) {
  return useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
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
  return useQuery<Message[]>({
    queryKey: ['conversation', userId],
    queryFn: () => fetchConversationWith(userId as string),
    enabled: !!userId,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sendMessage,
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['conversation', variables.recipientId] });
      queryClient.invalidateQueries({ queryKey: ['message-threads'] });
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
