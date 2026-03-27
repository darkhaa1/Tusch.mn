import { expect, test } from "@playwright/test";
import { injectAuthCookie, waitForAppIdle } from "./helpers/auth";
import { apiCreateListing, apiLogin, seedUser, uniqueEmail } from "./helpers/api";

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

    await injectAuthCookie(context, userA.cookie);
    await page.goto(`/listings/${listing.id}`);
    await expect(
      page.getByRole("button", { name: "Мессеж илгээх" }),
    ).toBeVisible({ timeout: 10_000 });
    await page.getByRole("button", { name: "Мессеж илгээх" }).click();

    await expect(
      page.getByRole("heading", { name: "Мессеж илгээх" }),
    ).toBeVisible({ timeout: 5_000 });

    const messageText = `E2E message ${Date.now()} from sender to owner`;
    await page.locator("textarea").fill(messageText);
    await page.getByRole("button", { name: "Илгээх" }).click();

    await expect(
      page.getByRole("heading", { name: "Мессеж илгээх" }),
    ).toBeHidden({ timeout: 10_000 });

    await context.clearCookies();
    const cookieB = await apiLogin(userB.email, passwordB);
    await injectAuthCookie(context, cookieB);

    await page.goto("/messages");
    await waitForAppIdle(page);
    await expect(page.getByText(/Sender/i)).toBeVisible({ timeout: 10_000 });
  });
});
