import { apiFetch } from "./base";
import type { ConversationPage, Message } from "./types";

export async function fetchMessageThreads(): Promise<Message[]> {
  return apiFetch("/messages/threads", { method: "GET" });
}

export async function fetchConversationWith(
  userId: string,
  page = 1,
  limit = 30,
): Promise<ConversationPage> {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));
  return apiFetch(`/messages/with/${userId}?${params}`, { method: "GET" });
}

export async function sendMessage(body: {
  recipientId: string;
  listingId: string;
  content: string;
}) {
  return apiFetch<Message>("/messages", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function markMessageRead(messageId: string) {
  return apiFetch<Message>(`/messages/${messageId}/read`, { method: "PATCH" });
}

export async function fetchUnreadCount(): Promise<{ count: number }> {
  return apiFetch("/messages/unread-count", { method: "GET" });
}
