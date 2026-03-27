import type { BrowserContext, Page } from "@playwright/test";

const API_URL =
  process.env.TEST_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:3410";

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
 * Waits for the web app to finish loading (no network activity) after
 * navigation, with a sensible timeout.
 */
export async function waitForAppIdle(page: Page): Promise<void> {
  await page.waitForLoadState("networkidle", { timeout: 15_000 });
}
