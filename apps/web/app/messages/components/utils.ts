import type { ListingUser } from "../../lib/api/types";

export function formatTime(value?: string) {
  if (!value) return "";
  try {
    return new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" }).format(new Date(value));
  } catch {
    return value || "";
  }
}

export function truncate(text: string, max = 80) {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

export function buildDisplayName(user?: ListingUser) {
  if (!user) return "Хэрэглэгч";
  return `${user.firstName} ${user.lastName}`.trim();
}
