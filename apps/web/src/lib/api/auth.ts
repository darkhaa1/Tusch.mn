import { apiFetch } from "./base";
import type { CurrentUser, UserRole } from "./types";

export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const data = await apiFetch<{ user: CurrentUser }>("/auth/me", {
      method: "GET",
    });
    return data.user;
  } catch {
    return null;
  }
}

export async function registerUser(body: {
  email: string;
  password: string;
  accountType: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string | null;
  acceptedTerms: boolean;
}) {
  return apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function loginUser(body: { email: string; password: string }) {
  return apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function oauthLogin(body: {
  email: string;
  firstName: string;
  lastName: string;
  provider: string;
  avatarUrl?: string | null;
}) {
  return apiFetch("/auth/oauth-login", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function logoutUser() {
  return apiFetch("/auth/logout", {
    method: "POST",
  });
}

export async function updateCurrentUser(
  body:
    | {
        firstName?: string;
        lastName?: string;
        phone?: string;
        avatarUrl?: string | null;
        accountType?: string;
        email?: string;
      }
    | FormData
) {
  return apiFetch<{ user: CurrentUser }>("/auth/me", {
    method: "PATCH",
    body: body instanceof FormData ? body : JSON.stringify(body),
  });
}

export async function changePassword(
  currentPassword: string,
  newPassword: string
) {
  return apiFetch<{ success: boolean }>("/auth/password", {
    method: "PATCH",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export async function updateMyRole(role: UserRole) {
  return apiFetch<{ user: CurrentUser }>("/users/me/role", {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });
}

export async function deleteCurrentUser() {
  return apiFetch("/auth/me", {
    method: "DELETE",
  });
}

export async function forgotPassword(email: string) {
  return apiFetch<{ success: boolean; token?: string }>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(token: string, newPassword: string) {
  return apiFetch<{ success: boolean }>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, newPassword }),
  });
}

export async function verifyEmail(token: string) {
  return apiFetch<{ message: string }>("/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
}

export async function resendVerification() {
  return apiFetch<{ message: string; token?: string }>("/auth/resend-verification", {
    method: "POST",
  });
}
