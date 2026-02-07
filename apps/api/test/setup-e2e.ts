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
