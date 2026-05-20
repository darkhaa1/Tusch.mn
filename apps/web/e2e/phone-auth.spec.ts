/**
 * Phone auth UI smoke test.
 *
 * Firebase is bypassed entirely via window.__tuschPhoneAuthTestOverride
 * (registered before the page loads). The backend /auth/phone/login call
 * is route-intercepted to avoid real Firebase verification.
 */
import { expect, test } from "@playwright/test";

const FAKE_ID_TOKEN = "fake-firebase-id-token";
const VALID_CODE = "123456";
const VALID_PHONE_E164 = "+97699112233";

test.describe("Phone auth UI", () => {
  test.beforeEach(async ({ page, context }) => {
    await context.addInitScript(
      ({ idToken, code }) => {
        // The hook checks for this override at runtime and short-circuits
        // around Firebase. See apps/web/src/lib/hooks/usePhoneAuth.ts.
        (window as unknown as Record<string, unknown>).__tuschPhoneAuthTestOverride = {
          sendCode: async (_phone: string) => true,
          verifyCode: async (input: string) =>
            input === code ? { idToken } : null,
        };
      },
      { idToken: FAKE_ID_TOKEN, code: VALID_CODE },
    );

    // Stub the backend so the test does not need a real Firebase Admin
    // configured on the API side.
    await page.route("**/auth/phone/login", async (route) => {
      const body = JSON.parse(route.request().postData() ?? "{}");
      if (body.idToken !== FAKE_ID_TOKEN) {
        await route.fulfill({
          status: 401,
          contentType: "application/json",
          body: JSON.stringify({ message: "Invalid token" }),
        });
        return;
      }
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        headers: {
          "set-cookie":
            "accessToken=test-jwt; Path=/; HttpOnly; SameSite=Lax",
        },
        body: JSON.stringify({
          user: {
            id: "usr_test",
            phone: body.phone,
            phoneVerified: true,
            email: null,
            avatarUrl: null,
          },
        }),
      });
    });
  });

  async function openLoginModalToPhoneStep(page: import("@playwright/test").Page) {
    await page.goto("/");
    await page.getByRole("button", { name: "Нэвтрэх", exact: true }).click();
    await page.getByRole("button", { name: "Утсаар нэвтрэх" }).click();
  }

  test("renders the phone entry inside the login modal", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Нэвтрэх", exact: true }).click();
    await expect(
      page.getByRole("button", { name: "Утсаар нэвтрэх" }),
    ).toBeVisible();
  });

  test("send-code button stays disabled until the phone is valid", async ({ page }) => {
    await openLoginModalToPhoneStep(page);
    const sendBtn = page.getByRole("button", { name: /Код илгээх|Илгээж/ });
    await expect(sendBtn).toBeDisabled();

    // Invalid leading digit (1) — backend would reject, UI keeps button disabled.
    await page.getByPlaceholder("9911 2233").fill("12345678");
    await expect(sendBtn).toBeDisabled();

    // Valid number — button enables.
    await page.getByPlaceholder("9911 2233").fill("99112233");
    await expect(sendBtn).toBeEnabled();
  });

  test("happy path: phone → code → backend login", async ({ page }) => {
    await openLoginModalToPhoneStep(page);

    await page.getByPlaceholder("9911 2233").fill("99112233");
    await page.getByRole("button", { name: /Код илгээх|Илгээж/ }).click();

    // Code step renders with the masked phone.
    await expect(page.getByText(/Кодыг оруулна уу/)).toBeVisible();

    // Auto-submit on 6 digits triggers the backend POST.
    const navAfterLogin = page.waitForURL("**/profile");
    await page.getByPlaceholder("6 оронтой код").fill(VALID_CODE);
    await navAfterLogin;
    expect(page.url()).toContain("/profile");
  });

  test("wrong code surfaces a Mongolian error message", async ({ page }) => {
    await openLoginModalToPhoneStep(page);
    await page.getByPlaceholder("9911 2233").fill("99112233");
    await page.getByRole("button", { name: /Код илгээх|Илгээж/ }).click();

    await page.getByPlaceholder("6 оронтой код").fill("000000");

    await expect(page.getByText("Код буруу байна")).toBeVisible();
  });
});

// Quiet linter for the unused E.164 constant — kept for future tests.
void VALID_PHONE_E164;
