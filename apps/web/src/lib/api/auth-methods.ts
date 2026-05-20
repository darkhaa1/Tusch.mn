import type { AuthMethods } from "@repo/shared";
import { apiFetch } from "./base";

export async function fetchAuthMethods() {
  return apiFetch<AuthMethods>("/users/me/auth-methods", { method: "GET" });
}
