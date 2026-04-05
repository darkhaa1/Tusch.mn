-- DropIndex
DROP INDEX "Listing_searchVector_gin_idx";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "acceptedTermsAt" TIMESTAMP(3);
