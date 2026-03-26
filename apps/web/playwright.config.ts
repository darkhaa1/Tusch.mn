import { defineConfig, devices } from "@playwright/test";

const BASE_URL = process.env.TEST_BASE_URL ?? "http://localhost:3000";
const API_URL = process.env.TEST_API_URL ?? "http://localhost:3310/api/v1";

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  retries: 0,
  workers: 1,
  reporter: [
    ["html", { outputFolder: "playwright-report", open: "never" }],
    ["list"],
  ],
  use: {
    baseURL: BASE_URL,
    screenshot: "only-on-failure",
    trace: "on-first-retry",
    extraHTTPHeaders: {
      "x-api-url": API_URL,
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: process.env.CI
    ? {
        command: "pnpm start",
        url: BASE_URL,
        reuseExistingServer: false,
        timeout: 60_000,
        env: {
          NEXT_PUBLIC_API_URL: API_URL,
          NEXTAUTH_SECRET: "test-nextauth-secret-min-32-chars-long",
          NEXTAUTH_URL: BASE_URL,
        },
      }
    : {
        command: "pnpm dev",
        url: BASE_URL,
        reuseExistingServer: true,
        timeout: 60_000,
      },
});
