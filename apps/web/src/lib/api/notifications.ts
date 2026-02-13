import { apiFetch } from "./base";
import type { Notification, NotificationsPage } from "./types";

export async function fetchNotifications(params?: {
  page?: number;
  limit?: number;
}): Promise<NotificationsPage> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));

  const query = searchParams.toString();
  const suffix = query ? `?${query}` : "";

  return apiFetch(`/notifications${suffix}`, { method: "GET" });
}

export async function markNotificationRead(notificationId: string): Promise<Notification> {
  return apiFetch(`/notifications/${notificationId}/read`, { method: "PATCH" });
}

export async function markAllNotificationsRead(): Promise<{ success: true }> {
  return apiFetch("/notifications/read-all", { method: "PATCH" });
}
