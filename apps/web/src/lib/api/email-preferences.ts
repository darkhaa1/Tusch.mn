import type { EmailNotificationPreferences } from "@repo/shared";
import { apiFetch } from "./base";

export interface EmailPreferencesResponse {
  preferences: Required<EmailNotificationPreferences>;
}

export async function fetchEmailPreferences() {
  return apiFetch<EmailPreferencesResponse>("/users/me/email-preferences", {
    method: "GET",
  });
}

export async function updateEmailPreferences(
  patch: EmailNotificationPreferences,
) {
  return apiFetch<EmailPreferencesResponse>("/users/me/email-preferences", {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}
