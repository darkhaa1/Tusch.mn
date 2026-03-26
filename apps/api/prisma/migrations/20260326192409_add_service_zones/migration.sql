-- CreateTable
CREATE TABLE "ServiceZone" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "district" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ServiceZone_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ServiceZone_userId_city_idx" ON "ServiceZone"("userId", "city");

-- AddForeignKey
ALTER TABLE "ServiceZone" ADD CONSTRAINT "ServiceZone_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
