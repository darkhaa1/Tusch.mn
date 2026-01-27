import { PrismaClient, UserStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error(
      'Usage: pnpm --filter api ts-node scripts/make-admin.ts user@email.com',
    );
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error(`User not found for email: ${email}`);
    process.exit(1);
  }

  await prisma.user.update({
    where: { email },
    data: { isAdmin: true, status: UserStatus.ACTIVE },
  });

  console.log(`User marked as admin: ${email}`);
}

main()
  .catch((error) => {
    console.error('Failed to promote admin:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
