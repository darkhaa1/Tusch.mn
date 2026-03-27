/**
 * Flow 1 — Auth
 *
 * 1. Without a session → API /auth/me returns 401
 * 2. Register + verify email + login → accessToken cookie injected
 * 3. With session → API /auth/me returns 200 + /profile shows user data
 * 4. Logout (POST /auth/logout) → cookie cleared → /auth/me returns 401
 */

import { test, expect } from "@playwright/test";
import { injectAuthCookie } from "./helpers/auth";
import { seedUser, uniqueEmail, apiLogin } from "./helpers/api";

const API_URL =
  process.env.TEST_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:3410";

test.describe("Flow 1 — Auth", () => {
  test("unauthenticated: /auth/me returns 401", async ({ request }) => {
    const res = await request.get(`${API_URL}/auth/me`);
    expect(res.status()).toBe(401);
  });

  test("register → verify email → login → profile accessible → logout", async ({
    page,
    context,
  }) => {
    const email = uniqueEmail("auth-flow");
    const password = "TestPassword123!";

    // ── 1. Seed user (register + verify email) ──────────────────────────────
    const { cookie } = await seedUser({
      email,
      password,
      firstName: "Auth",
      lastName: "Test",
    });

    // ── 2. Inject auth cookie into browser context ──────────────────────────
    await injectAuthCookie(context, cookie);

    // ── 3. Navigate to profile — user data should load ──────────────────────
    await page.goto("/profile");

    // The profile page calls GET /auth/me with the injected cookie.
    // When it succeeds, it renders user info (firstName "Auth" should appear).
    await expect(page.getByRole("heading", { name: /Auth Test/i })).toBeVisible({
      timeout: 10_000,
    });

    // ── 4. Verify GET /auth/me succeeds (API sees the cookie) ────────────────
    const meRes = await page.request.get(`${API_URL}/auth/me`);
    expect(meRes.status()).toBe(200);
    const me = await meRes.json();
    expect(me.user.email).toBe(email);

    // ── 5. Logout ────────────────────────────────────────────────────────────
    const logoutRes = await page.request.post(`${API_URL}/auth/logout`);
    expect(logoutRes.status()).toBe(201);

    // ── 6. After logout, /auth/me should return 401 ──────────────────────────
    const meAfter = await page.request.get(`${API_URL}/auth/me`);
    expect(meAfter.status()).toBe(401);
  });

  test("login with wrong password returns 401", async ({ request }) => {
    const email = uniqueEmail("wrong-pw");
    // Register but don't verify — still can't login with wrong password
    await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password: "CorrectPassword123!",
        firstName: "Wrong",
        lastName: "PW",
        phone: "99000001",
        accountType: "basic",
      }),
    });

    const res = await request.post(`${API_URL}/auth/login`, {
      data: { email, password: "WrongPassword456!" },
    });
    expect(res.status()).toBe(401);
  });

  test("re-login after logout restores session", async ({ page, context }) => {
    const email = uniqueEmail("relogin");
    const password = "TestPassword123!";

    const { cookie } = await seedUser({
      email,
      password,
      firstName: "Relogin",
      lastName: "User",
    });

    // Inject cookie and verify authenticated
    await injectAuthCookie(context, cookie);
    let meRes = await page.request.get(`${API_URL}/auth/me`);
    expect(meRes.status()).toBe(200);

    // Logout
    await page.request.post(`${API_URL}/auth/logout`);
    meRes = await page.request.get(`${API_URL}/auth/me`);
    expect(meRes.status()).toBe(401);

    // Re-login
    const newCookie = await apiLogin(email, password);
    await injectAuthCookie(context, newCookie);
    meRes = await page.request.get(`${API_URL}/auth/me`);
    expect(meRes.status()).toBe(200);
  });
});
