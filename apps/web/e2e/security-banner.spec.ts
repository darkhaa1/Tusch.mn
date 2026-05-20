/**
 * Security improvement banner + /settings/security page (US-A4).
 *
 * Auth-methods is intercepted so we can assert the banner reacts to the
 * declared state without having to massage the DB to a specific shape
 * from an e2e test (the column is server-managed and we have no admin
 * mutation endpoint for it).
 */
import { expect, test } from "@playwright/test";
import { injectAuthCookie } from "./helpers/auth";
import { seedUser, uniqueEmail } from "./helpers/api";

const EMAIL_ONLY_METHODS = {
  email: { value: "darkhaa@example.com", verified: true },
  phone: null,
  hasPassword: true,
  canUnlinkEmail: false,
  canUnlinkPhone: false,
};

test.describe("Security improvement banner", () => {
  test("shows when phone is missing and CTA lands on /settings/security", async ({
    page,
    context,
  }) => {
    const email = uniqueEmail("sec-banner-cta");
    const { cookie } = await seedUser({
      email,
      password: "TestPassword123!",
      firstName: "Sec",
      lastName: "Banner",
    });
    await injectAuthCookie(context, cookie);

    await page.route("**/users/me/auth-methods", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(EMAIL_ONLY_METHODS),
      }),
    );

    await page.goto("/profile");

    const banner = page.getByTestId("security-improvement-banner");
    await expect(banner).toBeVisible();
    // Reason copy is the "add phone" variant.
    await expect(banner).toContainText(/Утас/);

    await page.getByTestId("security-banner-cta").click();
    await page.waitForURL("**/settings/security");

    // PhoneLinkSection renders its own "link phone" button.
    await expect(
      page.getByRole("button", { name: /Утас холбох/ }),
    ).toBeVisible();
  });

  test("dismiss persists across reloads via localStorage", async ({
    page,
    context,
  }) => {
    const email = uniqueEmail("sec-banner-dismiss");
    const { cookie } = await seedUser({
      email,
      password: "TestPassword123!",
      firstName: "Sec",
      lastName: "Dismiss",
    });
    await injectAuthCookie(context, cookie);

    await page.route("**/users/me/auth-methods", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(EMAIL_ONLY_METHODS),
      }),
    );

    await page.goto("/profile");
    await expect(
      page.getByTestId("security-improvement-banner"),
    ).toBeVisible();

    await page.getByTestId("security-banner-dismiss").click();
    await expect(
      page.getByTestId("security-improvement-banner"),
    ).toBeHidden();

    await page.reload();
    await expect(
      page.getByTestId("security-improvement-banner"),
    ).toBeHidden();
  });
});
