import { apiFetch } from "./base";
import type { Message } from "./types";

export async function fetchMessageThreads(): Promise<Message[]> {
  return apiFetch("/messages/threads", { method: "GET" });
}

export async function fetchConversationWith(
  userId: string
): Promise<Message[]> {
  return apiFetch(`/messages/with/${userId}`, { method: "GET" });
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
