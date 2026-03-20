-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'REVIEW_REQUESTED';

-- DropIndex
DROP INDEX IF EXISTS "Review_targetUserId_reviewerId_key";

-- AlterTable: drop old unique, add offerId column, make comment required
ALTER TABLE "Review" ADD COLUMN "offerId" TEXT;
ALTER TABLE "Review" ALTER COLUMN "comment" SET NOT NULL;

-- Backfill: delete any orphaned reviews that have no offerId (legacy data)
DELETE FROM "Review" WHERE "offerId" IS NULL;

-- Make offerId NOT NULL after cleanup
ALTER TABLE "Review" ALTER COLUMN "offerId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "Review_offerId_idx" ON "Review"("offerId");

-- CreateUniqueIndex
CREATE UNIQUE INDEX "Review_reviewerId_offerId_key" ON "Review"("reviewerId", "offerId");
