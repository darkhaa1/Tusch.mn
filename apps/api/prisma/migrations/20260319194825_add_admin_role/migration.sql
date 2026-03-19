-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('USER', 'MODERATOR', 'ADMIN');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "adminRole" "AdminRole" NOT NULL DEFAULT 'USER';
