import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Listing,
  createListing,
  deleteListing,
  fetchListingById,
  fetchListings,
  fetchMyListings,
  fetchUsers,
  getCurrentUser,
  loginUser,
  logoutUser,
  oauthLogin,
  registerUser,
  updateCurrentUser,
  updateListing,
  deleteCurrentUser,
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

export function useDeleteCurrentUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCurrentUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-user'] });
    },
  });
}

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });
}
