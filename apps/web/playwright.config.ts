import { existsSync, readFileSync } from "node:fs";
import * as path from "node:path";
import { defineConfig, devices } from "@playwright/test";

const currentDir = __dirname;

function loadEnvFile(filePath: string) {
  if (!existsSync(filePath)) {
    return {} as Record<string, string>;
  }

  const env: Record<string, string> = {};

  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed
      .slice(separatorIndex + 1)
      .trim()
      .replace(/^['"]|['"]$/g, "");

    env[key] = value;
  }

  return env;
}

const webEnv = loadEnvFile(path.join(currentDir, ".env.test"));
const apiEnv = loadEnvFile(path.join(currentDir, "../api/.env.test"));

const BASE_URL =
  process.env.TEST_BASE_URL ?? webEnv.TEST_BASE_URL ?? "http://localhost:3100";
const API_URL =
  process.env.TEST_API_URL ??
  webEnv.TEST_API_URL ??
  webEnv.NEXT_PUBLIC_API_URL ??
  "http://localhost:3410";
const API_ORIGIN = new URL(API_URL).origin;
const API_PORT = new URL(API_ORIGIN).port || "3310";
const WEB_PORT = new URL(BASE_URL).port || "3100";
const NEXTAUTH_SECRET =
  process.env.NEXTAUTH_SECRET ?? "test-nextauth-secret-min-32-chars-long";

process.env.TEST_BASE_URL ??= BASE_URL;
process.env.TEST_API_URL ??= API_URL;
process.env.NEXT_PUBLIC_API_URL ??= API_URL;

const apiServerEnv = {
  NODE_ENV: "test",
  PORT: API_PORT,
  DATABASE_URL:
    process.env.DATABASE_URL ??
    apiEnv.DATABASE_URL ??
    apiEnv.DATABASE_URL_TEST ??
    "",
  JWT_SECRET: process.env.JWT_SECRET ?? apiEnv.JWT_SECRET ?? "test-secret-1234567890",
  CORS_ORIGIN: BASE_URL,
};

const managedApiServer = apiServerEnv.DATABASE_URL
  ? [
      {
        command: "pnpm --filter @repo/shared build && pnpm --filter api build && pnpm --filter api exec prisma migrate deploy && pnpm --filter api start:prod",
        url: `${API_ORIGIN}/health`,
        reuseExistingServer: true,
        timeout: 180_000,
        env: apiServerEnv,
      },
    ]
  : [];

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
  webServer: [
    ...managedApiServer,
    {
      command: `pnpm build && pnpm exec next start --port ${WEB_PORT}`,
      url: BASE_URL,
      reuseExistingServer: true,
      timeout: 180_000,
      env: {
        NEXT_PUBLIC_API_URL: API_URL,
        NEXTAUTH_SECRET,
        NEXTAUTH_URL: BASE_URL,
        // Fake Firebase config so the phone-auth UI is rendered. Tests
        // bypass Firebase entirely via window.__tuschPhoneAuthTestOverride
        // and route-intercept the backend, so these values are never used
        // for real network calls.
        NEXT_PUBLIC_FIREBASE_API_KEY: "test-key",
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "test.firebaseapp.com",
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: "test-project",
        NEXT_PUBLIC_FIREBASE_APP_ID: "1:1:web:test",
      },
    },
  ],
});
