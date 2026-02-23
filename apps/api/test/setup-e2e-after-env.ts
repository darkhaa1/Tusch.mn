import { readdirSync, unlinkSync } from 'fs';
import { join } from 'path';
import { cleanDatabase, prisma } from './utils/e2e-database';

const UPLOAD_DIRS = [
  join(process.cwd(), 'uploads', 'avatars'),
  join(process.cwd(), 'uploads', 'listings'),
];

function listFiles(dir: string): Set<string> {
  try {
    return new Set(readdirSync(dir));
  } catch {
    return new Set();
  }
}

// Capture once at module load, before any test suite runs
const preExistingFiles = new Map<string, Set<string>>(
  UPLOAD_DIRS.map((dir) => [dir, listFiles(dir)]),
);

beforeEach(async () => {
  await cleanDatabase();
});

afterAll(async () => {
  for (const dir of UPLOAD_DIRS) {
    const existing = preExistingFiles.get(dir) ?? new Set();
    for (const file of listFiles(dir)) {
      if (existing.has(file)) continue;
      try {
        unlinkSync(join(dir, file));
      } catch {
        // ignore
      }
    }
  }
  await prisma.$disconnect();
});
