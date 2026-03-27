import { expect, test } from "@playwright/test";
import { injectAuthCookie } from "./helpers/auth";
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

    // Wait for modal to open — "Шинэ зар" heading inside the portal
    await expect(
      page.getByRole("heading", { name: "Шинэ зар", level: 2 }),
    ).toBeVisible();

    // Step 1 — category: modal category buttons come after sidebar buttons in DOM
    // Use "Гэр цэвэрлэгээ" which exists in sidebar (ref=e77) AND modal (ref=e382),
    // .last() picks the modal one.
    await page.getByRole("button", { name: "Гэр цэвэрлэгээ" }).last().click();
    // "Дараах" pagination button is [disabled]; modal's is last enabled one
    await page.getByRole("button", { name: "Дараах" }).last().click();

    // Step 2 — price
    await page.locator('input[type="number"]').last().fill("50000");
    await page.getByRole("button", { name: "Дараах" }).last().click();

    // Step 3 — description + location
    await page.locator("textarea").last().fill(description);
    await page.locator('input[type="text"]').last().fill("Улаанбаатар");
    await page.getByRole("button", { name: "Дараах" }).last().click();

    // Step 4 — submit
    await page.getByRole("button", { name: "Илгээх" }).last().click();
    await expect(
      page.getByRole("heading", { name: "Шинэ зар", level: 2 }),
    ).toBeHidden({ timeout: 10_000 });

    await page.goto("/listings");
    const descParagraph = page.getByText(description).first();
    await expect(descParagraph).toBeVisible({ timeout: 10_000 });

    // The "Дэлгэрэнгүй" link is a sibling of the description paragraph inside the card
    await descParagraph.locator("..").getByRole("link", { name: "Дэлгэрэнгүй" }).click();
    await page.waitForURL(/\/listings\/[a-z0-9]+/i, { timeout: 10_000 });
    await expect(page.getByText(description)).toBeVisible({ timeout: 10_000 });
  });
});
