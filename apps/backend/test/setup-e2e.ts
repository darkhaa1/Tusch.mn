import { config } from 'dotenv';
import { resolve } from 'path';

const envPath = resolve(__dirname, '..', '.env.test');
config({ path: envPath });

if (!process.env.DATABASE_URL_TEST) {
  throw new Error('DATABASE_URL_TEST is missing in .env.test');
}

process.env.DATABASE_URL = process.env.DATABASE_URL_TEST;
process.env.NODE_ENV ??= 'test';
process.env.JWT_SECRET ??= 'test-secret';
