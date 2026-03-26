/**
 * Flow 3 — Message
 *
 * 1. Seed user A (client) + user B (client with a listing)
 * 2. Create a listing for user B via API
 * 3. Login as user A → navigate to user B's listing detail → send a message via the dialog
 * 4. Verify the send was successful (success feedback shown)
 * 5. Login as user B → navigate to /messages → verify message thread exists
 */

import { test, expect } from "@playwright/test";
import { injectAuthCookie } from "./helpers/auth";
import {
  seedUser,
  uniqueEmail,
  apiCreateListing,
  apiLogin,
} from "./helpers/api";

test.describe("Flow 3 — Message", () => {
  test("user A sends message on listing → user B sees it in /messages", async ({
    page,
    context,
  }) => {
    const passwordA = "TestPassword123!";
    const passwordB = "TestPassword456!";

    // ── 1. Seed two users ─────────────────────────────────────────────────────
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

    // ── 2. Create a listing for user B via API ────────────────────────────────
    const listing = await apiCreateListing(userB.cookie, {
      description: `Message test listing ${Date.now()}`,
      price: 25000,
      location: "Улаанбаатар",
      category: "cleaning",
    });

    // ── 3. Login as user A + inject cookie ────────────────────────────────────
    await injectAuthCookie(context, userA.cookie);

    // Navigate to the listing detail page
    await page.goto(`/listings/${listing.id}`);
    await page.waitForLoadState("networkidle");

    // ── 4. Open the message dialog ────────────────────────────────────────────
    // The sidebar has a "Мессеж илгээх" button (showMessageCta=true for non-owners)
    // and the dialog title is "Мессеж илгээх"
    const messageBtn = page
      .getByRole("button", { name: /мессеж/i })
      .first();
    await messageBtn.click();

    // Dialog should appear
    await expect(page.getByText("Мессеж илгээх")).toBeVisible({
      timeout: 5_000,
    });

    // ── 5. Type and send the message ──────────────────────────────────────────
    const messageText = `Сайн байна уу! Энэ бол E2E тест мессеж ${Date.now()}`;
    await page.locator("textarea").fill(messageText);

    // Submit button inside dialog: "Илгээх"
    await page.getByRole("button", { name: /^илгээх$/i }).click();

    // Feedback: "Мессеж илгээлээ." (from t("detail.errors.messageSent"))
    await expect(page.getByText(/мессеж илгээлээ/i)).toBeVisible({
      timeout: 8_000,
    });

    // ── 6. Switch to user B and check /messages ───────────────────────────────
    // Clear cookies and inject user B's session
    await context.clearCookies();
    const cookieB = await apiLogin(userB.email, passwordB);
    await injectAuthCookie(context, cookieB);

    await page.goto("/messages");
    await page.waitForLoadState("networkidle");

    // The thread list should contain a conversation with user A (Sender Alpha)
    await expect(page.getByText(/Sender/i)).toBeVisible({ timeout: 10_000 });
  });
});
