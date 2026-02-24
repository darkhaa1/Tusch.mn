-- CreateTable
CREATE TABLE "FavoriteListing" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FavoriteListing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FavoriteProvider" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FavoriteProvider_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FavoriteListing_userId_idx" ON "FavoriteListing"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "FavoriteListing_userId_listingId_key" ON "FavoriteListing"("userId", "listingId");

-- CreateIndex
CREATE INDEX "FavoriteProvider_userId_idx" ON "FavoriteProvider"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "FavoriteProvider_userId_providerId_key" ON "FavoriteProvider"("userId", "providerId");

-- AddForeignKey
ALTER TABLE "FavoriteListing" ADD CONSTRAINT "FavoriteListing_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteListing" ADD CONSTRAINT "FavoriteListing_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteProvider" ADD CONSTRAINT "FavoriteProvider_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteProvider" ADD CONSTRAINT "FavoriteProvider_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
