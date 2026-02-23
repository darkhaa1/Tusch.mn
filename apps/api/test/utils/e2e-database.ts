import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export async function cleanDatabase() {
  await prisma.$connect();
  await prisma.$executeRawUnsafe(
    'TRUNCATE TABLE "Offer", "Report", "Notification", "AdminActionLog", "Message", "ListingImage", "Review", "Listing", "User" RESTART IDENTITY CASCADE;',
  );
}
