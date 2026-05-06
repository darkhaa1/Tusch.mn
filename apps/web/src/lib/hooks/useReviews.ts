"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  checkReview,
  createReview,
  deleteReview,
  fetchUserReviews,
} from "@web/lib/api/reviews";
import type { ReviewsPage } from "@web/lib/api/types";
import { useCurrentUser } from "./useAuth";

export function useUserReviews(
  userId?: string,
  params?: { page?: number; limit?: number },
) {
  return useQuery<ReviewsPage>({
    queryKey: ["user-reviews", userId, params?.page || 1, params?.limit || 10],
    queryFn: () => fetchUserReviews(userId as string, params),
    enabled: !!userId,
  });
}

export function useCheckReview(offerId?: string) {
  const { data: user } = useCurrentUser();
  return useQuery<{ reviewed: boolean }>({
    queryKey: ["review-check", offerId],
    queryFn: () => checkReview(offerId as string),
    enabled: !!user && !!offerId,
    staleTime: 60_000,
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createReview,
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["review-check", variables.offerId],
      });
    },
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      reviewId,
      targetUserId,
    }: {
      reviewId: string;
      targetUserId: string;
    }) => deleteReview(reviewId),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["user-reviews", variables.targetUserId],
      });
      queryClient.invalidateQueries({
        queryKey: ["public-user-profile", variables.targetUserId],
      });
    },
  });
}
