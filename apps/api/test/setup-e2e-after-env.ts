import { cleanDatabase, prisma } from './utils/e2e-database';

beforeEach(async () => {
  await cleanDatabase();
});

afterAll(async () => {
  await prisma.$disconnect();
});
