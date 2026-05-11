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

    // Atelier modal: no "Шинэ зар" heading — detect open state via the close button
    // (aria-label "Хаах") which is inside the portal.
    const modalClose = page.getByRole("button", { name: "Хаах" }).first();
    await expect(modalClose).toBeVisible({ timeout: 10_000 });

    // Step 1 — category: sidebar buttons exist too, .last() picks the modal one
    await page.getByRole("button", { name: "Гэр цэвэрлэгээ" }).last().click();
    // Atelier renamed "Дараах" → "Үргэлжлүүлэх"
    await page.getByRole("button", { name: "Үргэлжлүүлэх" }).last().click();

    // Step 2 — price
    await page.locator('input[type="number"]').last().fill("50000");
    await page.getByRole("button", { name: "Үргэлжлүүлэх" }).last().click();

    // Step 3 — description + location
    await page.locator("textarea").last().fill(description);
    await page.locator('input[type="text"]').last().fill("Улаанбаатар");
    await page.getByRole("button", { name: "Үргэлжлүүлэх" }).last().click();

    // Step 4 — submit (button still labeled "Илгээх")
    await page.getByRole("button", { name: "Илгээх" }).last().click();
    await expect(modalClose).toBeHidden({ timeout: 10_000 });

    await page.goto("/listings");
    // Atelier ListingCard renders BOTH a mobile (md:hidden) and desktop (hidden md:flex)
    // variant, so the description text appears in multiple DOM nodes — some hidden.
    // Match the wrapping <a href="/listings/..."> with visible filter to pick the
    // desktop variant on test Chrome viewport.
    const cardLink = page
      .locator('a[href^="/listings/"]')
      .filter({ hasText: description, visible: true })
      .first();
    await expect(cardLink).toBeVisible({ timeout: 10_000 });
    await cardLink.click();
    await page.waitForURL(/\/listings\/[a-z0-9]+/i, { timeout: 10_000 });
    await expect(page.getByText(description).first()).toBeVisible({ timeout: 10_000 });
  });
});
