import { expect, test } from "@playwright/test";
import { injectAuthCookie, waitForAppIdle } from "./helpers/auth";
import { seedUser, uniqueEmail } from "./helpers/api";

test.describe("Flow 2 - Listing creation", () => {
  test("create listing via UI modal, then open its detail page", async ({
    page,
    context,
  }) => {
    const email = uniqueEmail("listing-flow");
    const { cookie } = await seedUser({
      email,
      password: "TestPassword123!",
      firstName: "Listing",
      lastName: "Creator",
    });

    await injectAuthCookie(context, cookie);

    const description = `E2E test listing ${Date.now()} for listing flow`;

    await page.goto("/listings");
    await expect(
      page.getByRole("button", { name: "Зар нэмэх" }).first(),
    ).toBeVisible();
    await page.getByRole("button", { name: "Зар нэмэх" }).first().click();

    await expect(
      page.getByRole("heading", { name: "Шинэ зар" }),
    ).toBeVisible();

    const categoryButtons = page.locator(
      'button[class*="rounded-xl"][class*="border"]',
    );
    await categoryButtons.first().click();
    await page.getByRole("button", { name: "Дараах" }).click();

    await page.locator('input[type="number"]').first().fill("50000");
    await page.getByRole("button", { name: "Дараах" }).click();

    await page.locator("textarea").first().fill(description);
    await page.locator('input[type="text"]').first().fill("Улаанбаатар");
    await page.getByRole("button", { name: "Дараах" }).click();

    await page.getByRole("button", { name: "Илгээх" }).click();
    await expect(
      page.getByRole("heading", { name: "Шинэ зар" }),
    ).toBeHidden({ timeout: 10_000 });

    await page.goto("/listings");
    const listingCard = page.getByText(description).first();
    await expect(listingCard).toBeVisible({ timeout: 10_000 });

    await listingCard.click();
    await waitForAppIdle(page);
    await expect(page.getByText(description)).toBeVisible({ timeout: 10_000 });
    expect(page.url()).toMatch(/\/listings\/[a-z0-9]+/i);
  });
});
