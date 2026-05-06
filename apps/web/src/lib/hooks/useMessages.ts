"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  fetchConversationWith,
  fetchMessageThreads,
  fetchUnreadCount,
  markMessageRead,
  sendMessage,
} from "@web/lib/api/messages";
import type { ConversationPage, Message } from "@web/lib/api/types";
import { useCurrentUser } from "./useAuth";

export function useMessageThreads(enabled = true) {
  return useQuery<Message[]>({
    queryKey: ["message-threads"],
    queryFn: fetchMessageThreads,
    enabled,
  });
}

export function useConversation(userId?: string) {
  return useInfiniteQuery<ConversationPage>({
    queryKey: ["conversation", userId],
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
    queryKey: ["unread-count"],
    queryFn: fetchUnreadCount,
    enabled: !!user,
    refetchInterval: 30_000,
    staleTime: 10_000,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sendMessage,
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["conversation", variables.recipientId],
      });
      queryClient.invalidateQueries({ queryKey: ["message-threads"] });
      queryClient.invalidateQueries({ queryKey: ["unread-count"] });
    },
  });
}

export function useMarkMessageRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      messageId,
    }: {
      messageId: string;
      partnerId?: string;
    }) => markMessageRead(messageId),
    onSuccess: (_result, variables) => {
      if (variables.partnerId) {
        queryClient.invalidateQueries({
          queryKey: ["conversation", variables.partnerId],
        });
      }
      queryClient.invalidateQueries({ queryKey: ["message-threads"] });
      queryClient.invalidateQueries({ queryKey: ["unread-count"] });
    },
  });
}
