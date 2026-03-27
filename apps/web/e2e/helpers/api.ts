/**
 * Direct API helpers for seeding test data.
 * Used by E2E tests to create users, listings, offers etc. without going through the UI.
 */

const API_URL =
  process.env.TEST_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:3410";

/** Unique email per test run */
export function uniqueEmail(prefix: string): string {
  return `${prefix}+${Date.now()}+${Math.floor(Math.random() * 99999)}@e2e.tusch.test`;
}

interface RegisteredUser {
  id: string;
  email: string;
  token: string; // email verify token (available in non-prod)
}

/** Register a new user and return the verify token */
export async function apiRegister(opts: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}): Promise<RegisteredUser> {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: opts.email,
      password: opts.password,
      firstName: opts.firstName,
      lastName: opts.lastName,
      phone: "99000000",
      accountType: "basic",
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`apiRegister failed ${res.status}: ${body}`);
  }
  return res.json() as Promise<RegisteredUser>;
}

/** Verify a user's email using the token returned by register */
export async function apiVerifyEmail(token: string): Promise<void> {
  const res = await fetch(`${API_URL}/auth/verify-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`apiVerifyEmail failed ${res.status}: ${body}`);
  }
}

/** Login and return the raw Set-Cookie header value */
export async function apiLogin(
  email: string,
  password: string,
): Promise<string> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`apiLogin failed ${res.status}: ${body}`);
  }
  const setCookie = res.headers.get("set-cookie");
  if (!setCookie) throw new Error("No set-cookie header from login");
  return setCookie;
}

/** Create a listing via API (requires cookie) */
export async function apiCreateListing(
  cookie: string,
  data: {
    description: string;
    price: number;
    location?: string;
    category: string;
  },
): Promise<{ id: string }> {
  const res = await fetch(`${API_URL}/listings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookie,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`apiCreateListing failed ${res.status}: ${body}`);
  }
  return res.json() as Promise<{ id: string }>;
}

/** Complete onboarding so the web app does not redirect seeded users */
export async function apiCompleteOnboarding(
  cookie: string,
  data: { role: "CLIENT" | "PROVIDER" },
): Promise<void> {
  const res = await fetch(`${API_URL}/users/onboarding`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookie,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`apiCompleteOnboarding failed ${res.status}: ${body}`);
  }
}

/** Send a message via API (requires cookie) */
export async function apiSendMessage(
  cookie: string,
  data: { recipientId: string; content: string; listingId?: string },
): Promise<{ id: string }> {
  const res = await fetch(`${API_URL}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookie,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`apiSendMessage failed ${res.status}: ${body}`);
  }
  return res.json() as Promise<{ id: string }>;
}

/** Create an offer via API (requires cookie, user must be PROVIDER) */
export async function apiCreateOffer(
  cookie: string,
  listingId: string,
  data: { price: number; message: string },
): Promise<{ id: string; status: string }> {
  const res = await fetch(`${API_URL}/offers/listing/${listingId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookie,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`apiCreateOffer failed ${res.status}: ${body}`);
  }
  return res.json() as Promise<{ id: string; status: string }>;
}

/** Get current user info via API (requires cookie) */
export async function apiGetMe(
  cookie: string,
): Promise<{ id: string; email: string; role: string }> {
  const res = await fetch(`${API_URL}/auth/me`, {
    method: "GET",
    headers: { Cookie: cookie },
  });
  if (!res.ok) throw new Error(`apiGetMe failed ${res.status}`);
  const body = (await res.json()) as { user: { id: string; email: string; role: string } };
  return body.user;
}

/**
 * Register + verify email + login.
 * Returns `{ id, email, cookie }` where cookie is the raw Set-Cookie string.
 */
export async function seedUser(opts: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: "PROVIDER";
}): Promise<{ id: string; email: string; cookie: string }> {
  const registered = await apiRegister(opts);
  await apiVerifyEmail(registered.token);
  const rawCookie = await apiLogin(opts.email, opts.password);
  // Extract just the cookie value (before any attributes like Path, HttpOnly etc.)
  const cookieValue = rawCookie.split(";")[0];

  await apiCompleteOnboarding(cookieValue, {
    role: opts.role === "PROVIDER" ? "PROVIDER" : "CLIENT",
  });

  return { id: registered.id, email: opts.email, cookie: cookieValue };
}
