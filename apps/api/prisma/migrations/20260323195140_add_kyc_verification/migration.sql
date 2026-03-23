-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('NOT_SUBMITTED', 'PENDING', 'VERIFIED', 'REJECTED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'IDENTITY_VERIFIED';
ALTER TYPE "NotificationType" ADD VALUE 'IDENTITY_REJECTED';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "verificationDocumentUrl" TEXT,
ADD COLUMN     "verificationRejectedReason" TEXT,
ADD COLUMN     "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'NOT_SUBMITTED',
ADD COLUMN     "verifiedAt" TIMESTAMP(3);
