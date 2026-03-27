import { expect, test } from "@playwright/test";
import { injectAuthCookie, waitForAppIdle } from "./helpers/auth";
import { apiCreateListing, apiLogin, seedUser, uniqueEmail } from "./helpers/api";

const API_URL =
  process.env.TEST_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:3410";

test.describe("Flow 4 - Offer", () => {
  test("provider sends an offer and client accepts it", async ({
    page,
    context,
  }) => {
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

    const listing = await apiCreateListing(client.cookie, {
      description: `Offer test listing ${Date.now()} for offer flow`,
      price: 30000,
      location: "Улаанбаатар",
      category: "network_repair",
    });

    await injectAuthCookie(context, provider.cookie);
    await page.goto(`/listings/${listing.id}`);
    await expect(
      page.getByRole("button", { name: "Санал илгээх" }),
    ).toBeVisible({ timeout: 10_000 });
    await page.getByRole("button", { name: "Санал илгээх" }).click();

    await expect(
      page.getByRole("heading", { name: "Санал илгээх" }),
    ).toBeVisible({ timeout: 5_000 });

    await page.locator('input[type="number"]').first().fill("28000");
    await page.locator("textarea").fill("E2E offer message from provider");
    await page.getByRole("button", { name: "Санал илгээх" }).last().click();

    await expect(page.getByRole("status")).toContainText("Санал илгээгдлээ.");

    const sentRes = await page.request.get(`${API_URL}/offers/sent`);
    expect(sentRes.status()).toBe(200);
    const sent = await sentRes.json();
    expect(sent.items.length).toBeGreaterThan(0);
    const offer = sent.items[0] as { id: string; status: string };
    expect(offer.status).toBe("PENDING");
    const offerId = offer.id;

    await context.clearCookies();
    const cookieClient = await apiLogin(client.email, passwordClient);
    await injectAuthCookie(context, cookieClient);

    await page.goto(`/listings/${listing.id}`);
    await waitForAppIdle(page);
    await page.getByRole("tab", { name: "Ирсэн санал" }).click();

    await expect(page.getByText("Зөвшөөрөх")).toBeVisible({ timeout: 8_000 });
    await page.getByRole("button", { name: "Зөвшөөрөх" }).first().click();
    await expect(
      page.getByRole("heading", { name: "Саналыг зөвшөөрөх үү?" }),
    ).toBeVisible({ timeout: 5_000 });
    await page.getByRole("button", { name: "Зөвшөөрөх" }).last().click();

    await expect(page.getByRole("status")).toContainText("Санал зөвшөөрөгдлөө.");

    const receivedRes = await page.request.get(`${API_URL}/offers/received`);
    expect(receivedRes.status()).toBe(200);
    const received = await receivedRes.json();
    const acceptedOffer = (received.items as Array<{ id: string; status: string }>).find(
      (item) => item.id === offerId,
    );
    expect(acceptedOffer?.status).toBe("ACCEPTED");

    await context.clearCookies();
    const cookieProvider = await apiLogin(provider.email, passwordProvider);
    await injectAuthCookie(context, cookieProvider);

    const sentAfterRes = await page.request.get(`${API_URL}/offers/sent`);
    const sentAfter = await sentAfterRes.json();
    const providerOffer = (sentAfter.items as Array<{ id: string; status: string }>).find(
      (item) => item.id === offerId,
    );
    expect(providerOffer?.status).toBe("ACCEPTED");
  });
});
