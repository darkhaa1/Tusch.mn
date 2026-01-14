import { execSync } from 'child_process';
import { resolve } from 'path';
import './setup-e2e';

export default async function globalSetup() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set for e2e tests.');
  }

  execSync('pnpm prisma migrate deploy', {
    cwd: resolve(__dirname, '..'),
    stdio: 'inherit',
    env: { ...process.env },
  });
}
