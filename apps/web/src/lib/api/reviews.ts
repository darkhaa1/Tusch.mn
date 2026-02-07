import { apiFetch } from "./base";

export type Review = {
  id: string;
  targetUserId: string;
  reviewerId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  reviewer: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  };
};

export type ReviewsPage = {
  items: Review[];
  total: number;
  page: number;
  limit: number;
};

export async function createReview(body: {
  targetUserId: string;
  rating: number;
  comment?: string;
}): Promise<Review> {
  return apiFetch<Review>("/reviews", {
    method: "POST",
    body: JSON.stringify(body),
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
