-- AlterEnum
ALTER TYPE "OfferStatus" ADD VALUE 'COMPLETED';

-- AlterTable
ALTER TABLE "Offer" ADD COLUMN     "clientNote" TEXT,
ADD COLUMN     "completedAt" TIMESTAMP(3);
