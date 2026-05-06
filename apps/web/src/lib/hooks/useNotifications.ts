"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@web/lib/api/notifications";
import type { NotificationsPage } from "@web/lib/api/types";
import { useCurrentUser } from "./useAuth";

export function useNotifications(params?: { page?: number; limit?: number }) {
  const { data: user } = useCurrentUser();
  return useQuery<NotificationsPage>({
    queryKey: ["notifications", params?.page || 1, params?.limit || 10],
    queryFn: () => fetchNotifications(params),
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
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
