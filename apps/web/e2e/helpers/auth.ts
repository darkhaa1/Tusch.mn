import type { BrowserContext, Page } from "@playwright/test";
import { encode as nextAuthEncode } from "next-auth/jwt";

const API_URL =
  process.env.TEST_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:3410";

const BASE_URL =
  process.env.TEST_BASE_URL ?? "http://localhost:3100";

const NEXTAUTH_SECRET =
  process.env.NEXTAUTH_SECRET ?? "test-nextauth-secret-min-32-chars-long";

/**
 * Injects the `accessToken` cookie from a raw Set-Cookie header string
 * into the Playwright browser context so that subsequent page navigation
 * will authenticate API requests made by the web app.
 */
export async function injectAuthCookie(
  context: BrowserContext,
  rawSetCookie: string,
): Promise<void> {
  // Parse "accessToken=<value>; Path=/; ..."
  const cookieValue = rawSetCookie.split(";")[0];
  const [name, value] = cookieValue.split("=");

  const apiOrigin = new URL(API_URL).origin; // e.g. http://localhost:3310

  await context.addCookies([
    {
      name: name.trim(),
      value: value.trim(),
      domain: new URL(API_URL).hostname, // e.g. localhost
      path: "/",
      httpOnly: false, // false so playwright can set it; the server enforces httpOnly on its own responses
      secure: false,
      sameSite: "Lax",
    },
  ]);

  void apiOrigin; // used for documentation
}

/**
 * Mints a NextAuth session-token cookie and injects it into the browser
 * context. Required for any test that navigates to a middleware-gated
 * route (`/settings/*`, `/dashboard/*`, `/messages/*`, `/offers/*`,
 * `/admin/*`) — see apps/web/src/middleware.ts. The mint uses the same
 * NEXTAUTH_SECRET passed to next start (set in playwright.config.ts), so
 * `getToken()` on the server side accepts it.
 *
 * For tests that only need API auth (e.g. /profile, which is not gated
 * by the middleware), use injectAuthCookie alone.
 */
export async function injectNextAuthSession(
  context: BrowserContext,
  payload: {
    email: string;
    name?: string;
    adminRole?: "USER" | "MODERATOR" | "ADMIN";
  },
): Promise<void> {
  const token = await nextAuthEncode({
    token: {
      email: payload.email,
      name: payload.name ?? "Test User",
      adminRole: payload.adminRole ?? "USER",
      // Future-proofing: any other claims required by jwt callback can
      // be added here without breaking existing callers.
    },
    secret: NEXTAUTH_SECRET,
  });

  await context.addCookies([
    {
      name: "next-auth.session-token",
      value: token,
      domain: new URL(BASE_URL).hostname,
      path: "/",
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
    },
  ]);
}

/**
 * Waits for the web app to finish loading (no network activity) after
 * navigation, with a sensible timeout.
 */
export async function waitForAppIdle(page: Page): Promise<void> {
  await page.waitForLoadState("networkidle", { timeout: 15_000 });
}
