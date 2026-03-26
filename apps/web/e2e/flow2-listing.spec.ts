/**
 * Flow 2 — Annonce (Listing)
 *
 * 1. Login as a user
 * 2. Navigate to /listings
 * 3. Open "Зар нэмэх" modal (multi-step)
 *    Step 1: pick category
 *    Step 2: set price
 *    Step 3: fill description + location
 *    Step 4: skip images → submit
 * 4. Verify listing appears in /listings (by its description)
 * 5. Navigate to listing detail page — verify it loads
 */

import { test, expect } from "@playwright/test";
import { injectAuthCookie } from "./helpers/auth";
import { seedUser, uniqueEmail } from "./helpers/api";

test.describe("Flow 2 — Listing creation", () => {
  test("create listing via UI modal → appears in list → detail accessible", async ({
    page,
    context,
  }) => {
    // ── 1. Seed user ─────────────────────────────────────────────────────────
    const email = uniqueEmail("listing-flow");
    const { cookie } = await seedUser({
      email,
      password: "TestPassword123!",
      firstName: "Listing",
      lastName: "Creator",
    });
    await injectAuthCookie(context, cookie);

    // Unique description so we can find this listing in the list
    const description = `E2E test listing ${Date.now()} — нарийн засвар`;

    // ── 2. Navigate to /listings ──────────────────────────────────────────────
    await page.goto("/listings");
    await page.waitForLoadState("networkidle");

    // ── 3. Open modal — "Зар нэмэх" button ───────────────────────────────────
    // The button text comes from t("client.addListing") = "Зар нэмэх"
    await page.getByRole("button", { name: /зар нэмэх/i }).click();

    // Modal should appear with title "Шинэ зар"
    await expect(page.getByText("Шинэ зар")).toBeVisible({ timeout: 5_000 });

    // ── Step 1: Select category ───────────────────────────────────────────────
    // Categories are rendered as buttons; pick the first visible one (any category)
    const categoryButtons = page.locator(
      'button[class*="rounded-xl"][class*="border"]',
    );
    await categoryButtons.first().click();

    // Click "Дараах" to advance
    await page.getByRole("button", { name: /дараах/i }).click();

    // ── Step 2: Enter price ───────────────────────────────────────────────────
    const priceInput = page.locator('input[type="number"]').first();
    await priceInput.fill("50000");
    await page.getByRole("button", { name: /дараах/i }).click();

    // ── Step 3: Description + location ───────────────────────────────────────
    await page.locator("textarea").first().fill(description);
    await page.locator('input[placeholder*="Хот"]').fill("Улаанбаатар");
    await page.getByRole("button", { name: /дараах/i }).click();

    // ── Step 4: Images (skip) → Submit ────────────────────────────────────────
    // On step 4 the button text changes to "Илгээх"
    await page.getByRole("button", { name: /илгээх/i }).click();

    // Modal closes — wait for it to disappear
    await expect(page.getByText("Шинэ зар")).toBeHidden({ timeout: 10_000 });

    // ── 4. Verify listing appears in the list ────────────────────────────────
    // Reload the listings page to get fresh data
    await page.goto("/listings");
    await page.waitForLoadState("networkidle");

    // The listing card should contain the unique description snippet
    const listingCard = page.getByText(/E2E test listing/i).first();
    await expect(listingCard).toBeVisible({ timeout: 10_000 });

    // ── 5. Navigate to listing detail ────────────────────────────────────────
    await listingCard.click();
    await page.waitForLoadState("networkidle");

    // Detail page should show the description
    await expect(page.getByText(/E2E test listing/i)).toBeVisible({
      timeout: 10_000,
    });
    // URL should be /listings/<id>
    expect(page.url()).toMatch(/\/listings\/[a-z0-9]+/i);
  });
});
