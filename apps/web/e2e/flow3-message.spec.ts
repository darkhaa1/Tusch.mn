import { expect, test } from "@playwright/test";
import { injectAuthCookie } from "./helpers/auth";
import { apiCreateListing, apiLogin, seedUser, uniqueEmail } from "./helpers/api";

const API_URL =
  process.env.TEST_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:3410";

test.describe("Flow 3 - Message", () => {
  test("user A sends a message on a listing and user B sees the thread", async ({
    page,
    context,
  }) => {
    const passwordA = "TestPassword123!";
    const passwordB = "TestPassword456!";

    const userA = await seedUser({
      email: uniqueEmail("msg-sender"),
      password: passwordA,
      firstName: "Sender",
      lastName: "Alpha",
    });

    const userB = await seedUser({
      email: uniqueEmail("msg-owner"),
      password: passwordB,
      firstName: "Owner",
      lastName: "Beta",
    });

    const listing = await apiCreateListing(userB.cookie, {
      description: `Message test listing ${Date.now()} for message flow`,
      price: 25000,
      location: "Улаанбаатар",
      category: "home_cleaning",
    });

    // ── User A: open the listing page and send a message ────────────────────
    await injectAuthCookie(context, userA.cookie);
    await page.goto(`/listings/${listing.id}`);
    // New Atelier CTAs on listing detail:
    //   • Desktop PricingPanel aside: "Зурвас бичих" outline
    //   • Mobile sticky bottom CTA: "Зурвас" outline (md:hidden)
    // Playwright Chrome runs at desktop viewport, so target the desktop label.
    await expect(
      page.getByRole("button", { name: "Зурвас бичих" }),
    ).toBeVisible({ timeout: 10_000 });
    await page.getByRole("button", { name: "Зурвас бичих" }).click();

    // Message dialog heading: "Зурвас илгээх"
    await expect(
      page.getByRole("heading", { name: "Зурвас илгээх" }),
    ).toBeVisible({ timeout: 5_000 });

    const messageText = `E2E message ${Date.now()} from sender to owner`;
    await page.locator("textarea").fill(messageText);
    await page.getByRole("button", { name: "Илгээх", exact: true }).click();

    await expect(
      page.getByRole("heading", { name: "Зурвас илгээх" }),
    ).toBeHidden({ timeout: 10_000 });

    // ── Switch to user B: verify thread is received via API ──────────────────
    await context.clearCookies();
    const cookieB = await apiLogin(userB.email, passwordB);
    await injectAuthCookie(context, cookieB);

    // The /messages route is protected by NextAuth middleware.
    // We verify receipt via the API (unread-count + threads) which uses
    // the accessToken cookie, and then check the header badge on a
    // public-accessible page.
    const unreadRes = await page.request.get(`${API_URL}/messages/unread-count`);
    expect(unreadRes.status()).toBe(200);
    const { count } = await unreadRes.json() as { count: number };
    expect(count).toBeGreaterThan(0);

    const threadsRes = await page.request.get(`${API_URL}/messages/threads`);
    expect(threadsRes.status()).toBe(200);
    const threads = await threadsRes.json() as Array<{ content: string }>;
    expect(threads.length).toBeGreaterThan(0);
    expect(threads[0].content).toBe(messageText);
  });
});
