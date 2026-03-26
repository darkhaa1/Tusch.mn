/**
 * Flow 4 — Offer
 *
 * 1. Seed provider + client; client creates a listing via API
 * 2. Login as provider → navigate to listing detail → send offer via "Санал илгээх" modal
 * 3. Verify offer appears (toast "Санал илгээгдлээ.")
 * 4. Verify offer status via API = PENDING
 * 5. Login as client → open listing detail → go to "Ирсэн санал" tab → accept offer
 * 6. Verify offer status via API = ACCEPTED from both sides
 */

import { test, expect } from "@playwright/test";
import { injectAuthCookie } from "./helpers/auth";
import {
  seedUser,
  uniqueEmail,
  apiCreateListing,
  apiLogin,
} from "./helpers/api";

const API_URL = process.env.TEST_API_URL ?? "http://localhost:3310/api/v1";

test.describe("Flow 4 — Offer", () => {
  test("provider sends offer → client accepts → status ACCEPTED", async ({
    page,
    context,
  }) => {
    // ── 1. Seed users ─────────────────────────────────────────────────────────
    const passwordClient = "TestPassword123!";
    const passwordProvider = "TestPassword456!";

    const client = await seedUser({
      email: uniqueEmail("offer-client"),
      password: passwordClient,
      firstName: "Client",
      lastName: "Owner",
    });

    const provider = await seedUser({
      email: uniqueEmail("offer-provider"),
      password: passwordProvider,
      firstName: "Provider",
      lastName: "User",
      role: "PROVIDER",
    });

    // ── 2. Client creates a listing via API ───────────────────────────────────
    const listing = await apiCreateListing(client.cookie, {
      description: `Offer test listing ${Date.now()} — туслах шаардлагатай`,
      price: 30000,
      location: "Дархан",
      category: "plumbing",
    });

    // ── 3. Login as provider + navigate to listing ────────────────────────────
    await injectAuthCookie(context, provider.cookie);
    await page.goto(`/listings/${listing.id}`);
    await page.waitForLoadState("networkidle");

    // ── 4. Click "Санал илгээх" (make offer CTA in sidebar) ──────────────────
    // The offer CTA is rendered when canMakeOffer=true (user is PROVIDER, not owner)
    const offerCta = page
      .getByRole("button", { name: /санал илгээх/i })
      .first();
    await offerCta.click();

    // Offer modal dialog should open (title "Санал илгээх")
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 5_000 });

    // ── 5. Fill offer form ────────────────────────────────────────────────────
    // Price input (label "Үнэ")
    const priceInput = page
      .getByRole("dialog")
      .locator('input[type="number"]');
    await priceInput.fill("28000");

    // Message textarea
    const msgTextarea = page.getByRole("dialog").locator("textarea");
    await msgTextarea.fill("E2E тест санал — та надтай холбогдоно уу.");

    // Submit: button "Санал илгээх" inside dialog footer
    await page
      .getByRole("dialog")
      .getByRole("button", { name: /санал илгээх/i })
      .click();

    // Toast: "Санал илгээгдлээ."
    await expect(page.getByText(/санал илгээгдлээ/i)).toBeVisible({
      timeout: 10_000,
    });

    // ── 6. Verify offer status via API = PENDING ──────────────────────────────
    const offersRes = await page.request.get(
      `${API_URL}/offers/listing/${listing.id}`,
    );
    // Provider cannot view listing's offers (only owner can), use sent offers
    const sentRes = await page.request.get(`${API_URL}/offers/sent`);
    expect(sentRes.status()).toBe(200);
    const sent = await sentRes.json();
    expect(sent.items.length).toBeGreaterThan(0);
    const offer = sent.items[0] as { id: string; status: string };
    expect(offer.status).toBe("PENDING");
    const offerId = offer.id;

    void offersRes; // listing owner check only (not provider)

    // ── 7. Switch to client and accept the offer ──────────────────────────────
    await context.clearCookies();
    const cookieClient = await apiLogin(client.email, passwordClient);
    await injectAuthCookie(context, cookieClient);

    // Navigate to the listing detail
    await page.goto(`/listings/${listing.id}`);
    await page.waitForLoadState("networkidle");

    // Click the "Ирсэн санал" tab (offers tab, visible only to listing owner)
    await page.getByRole("tab", { name: /ирсэн санал/i }).click();

    // Offer card should be visible with status PENDING
    await expect(page.getByText(/хүлээгдэж байна/i)).toBeVisible({
      timeout: 8_000,
    });

    // Click "Зөвшөөрөх" to accept
    await page.getByRole("button", { name: /зөвшөөрөх/i }).first().click();

    // Toast: "Санал зөвшөөрөгдлөө."
    await expect(page.getByText(/зөвшөөрөгдлөө/i)).toBeVisible({
      timeout: 10_000,
    });

    // ── 8. Verify status ACCEPTED via API ─────────────────────────────────────
    const receivedRes = await page.request.get(`${API_URL}/offers/received`);
    expect(receivedRes.status()).toBe(200);
    const received = await receivedRes.json();
    const acceptedOffer = (received.items as Array<{ id: string; status: string }>).find(
      (o) => o.id === offerId,
    );
    expect(acceptedOffer?.status).toBe("ACCEPTED");

    // Switch back to provider and verify their sent offer is also ACCEPTED
    await context.clearCookies();
    const cookieProvider = await apiLogin(provider.email, passwordProvider);
    await injectAuthCookie(context, cookieProvider);

    const sentAfterRes = await page.request.get(`${API_URL}/offers/sent`);
    const sentAfter = await sentAfterRes.json();
    const providerOffer = (
      sentAfter.items as Array<{ id: string; status: string }>
    ).find((o) => o.id === offerId);
    expect(providerOffer?.status).toBe("ACCEPTED");
  });
});
