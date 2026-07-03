// E2E runs must never reach the real Resend API. Deleting the env vars in
// setup-e2e.ts is not enough: @prisma/client re-loads the repo-root .env
// (Prisma's bundled dotenv) on import/instantiation and silently restores
// RESEND_API_KEY, so EmailService would send real emails. Stubbing the SDK
// here makes external sends impossible regardless of the environment. See
// apps/api/test/jest-e2e.json moduleNameMapper.
export class Resend {
  readonly emails = {
    send: async (): Promise<{
      data: { id: string } | null;
      error: { name: string; message: string } | null;
    }> => ({ data: { id: 'e2e-mock-email-id' }, error: null }),
  };
}
