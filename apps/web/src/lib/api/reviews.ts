import { apiFetch } from "./base";
import type { Review, ReviewsPage } from "./types";

export async function createReview(body: {
  offerId: string;
  rating: number;
  comment: string;
}): Promise<Review> {
  return apiFetch<Review>("/reviews", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function checkReview(offerId: string): Promise<{ reviewed: boolean }> {
  return apiFetch<{ reviewed: boolean }>(`/reviews/offer/${offerId}/mine`, {
    method: "GET",
  });
}

export async function fetchUserReviews(
  userId: string,
  params?: { page?: number; limit?: number }
): Promise<ReviewsPage> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));
  const query = searchParams.toString();
  const path = query
    ? `/reviews/user/${userId}?${query}`
    : `/reviews/user/${userId}`;
  return apiFetch<ReviewsPage>(path, { method: "GET" });
}

export async function deleteReview(reviewId: string): Promise<{ ok: boolean }> {
  return apiFetch(`/reviews/${reviewId}`, {
    method: "DELETE",
  });
}
