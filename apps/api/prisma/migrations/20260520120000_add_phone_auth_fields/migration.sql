-- US-A1: Phone auth fields + relax NOT NULL on email/password
--
-- Non-destructive: relaxes NOT NULL on email, password, phone; adds the
-- new phone auth fields. Existing data is preserved. Empty-string phones
-- (created by older OAuth signups that wrote phone='') are normalized to
-- NULL so that the new UNIQUE constraint on phone can be applied without
-- collisions.

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "firebaseUid" TEXT,
ADD COLUMN     "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "phoneVerifiedAt" TIMESTAMP(3),
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "password" DROP NOT NULL,
ALTER COLUMN "phone" DROP NOT NULL;

-- Normalize empty-string phones to NULL so the UNIQUE constraint below
-- does not collide on legacy OAuth users that were created with phone=''.
UPDATE "User" SET "phone" = NULL WHERE "phone" = '';

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "User_firebaseUid_key" ON "User"("firebaseUid");

-- CreateIndex
CREATE INDEX "User_phone_idx" ON "User"("phone");

-- CreateIndex
CREATE INDEX "User_firebaseUid_idx" ON "User"("firebaseUid");
