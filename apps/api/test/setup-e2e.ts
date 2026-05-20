import { config } from 'dotenv';
import { resolve } from 'path';

const envPath = resolve(__dirname, '..', '.env.test');
const shouldLoadDotenv = !process.env.DATABASE_URL && process.env.CI !== 'true';

if (shouldLoadDotenv) {
  config({ path: envPath });
}

if (!process.env.DATABASE_URL && process.env.DATABASE_URL_TEST) {
  process.env.DATABASE_URL = process.env.DATABASE_URL_TEST;
}

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set for e2e tests.');
}

process.env.NODE_ENV ??= 'test';
process.env.JWT_SECRET ??= 'test-secret-1234567890';
process.env.CORS_ORIGIN ??= 'http://localhost:3000';

// Hard-disable real email sending in e2e runs so tests never burn quota
// against Resend (and never accidentally email real addresses). Delete
// rather than blank — env.schema's superRefine requires RESEND_FROM_EMAIL
// when RESEND_API_KEY is set, so leaving an empty string would fail
// validation.
delete process.env.RESEND_API_KEY;
delete process.env.RESEND_FROM_EMAIL;
delete process.env.RESEND_FROM_NAME;
