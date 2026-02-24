import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ListingStatus } from '@repo/shared';
import { PrismaService } from '../../database/prisma.service';

const listingPublicInclude = {
  user: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      avatarUrl: true,
    },
  },
  images: {
    orderBy: { position: 'asc' as const },
  },
  _count: {
    select: { favoritedBy: true },
  },
} as const;

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  private getTopCategory(
    listings: Array<{ category: string | null }>,
  ): string | null {
    const counts = new Map<string, number>();
    for (const listing of listings) {
      if (!listing.category) continue;
      counts.set(listing.category, (counts.get(listing.category) || 0) + 1);
    }

    let topCategory: string | null = null;
    let topCount = 0;
    for (const [category, count] of counts) {
      if (count > topCount) {
        topCategory = category;
        topCount = count;
      }
    }

    return topCategory;
  }

  async addListingFavorite(userId: string, listingId: string) {
    const listing = await this.prisma.listing.findFirst({
      where: {
        id: listingId,
        status: ListingStatus.ACTIVE,
        deletedAt: null,
        user: { deletedAt: null },
      },
      select: { id: true, userId: true },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    if (listing.userId === userId) {
      throw new BadRequestException('Cannot favorite your own listing');
    }

    const existing = await this.prisma.favoriteListing.findUnique({
      where: { userId_listingId: { userId, listingId } },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException('Listing already favorited');
    }

    return this.prisma.favoriteListing.create({
      data: { userId, listingId },
    });
  }

  async removeListingFavorite(userId: string, listingId: string) {
    const existing = await this.prisma.favoriteListing.findUnique({
      where: { userId_listingId: { userId, listingId } },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException('Favorite not found');
    }

    await this.prisma.favoriteListing.delete({
      where: { userId_listingId: { userId, listingId } },
    });

    return { ok: true };
  }

  async listFavoriteListings(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const where = {
      userId,
      listing: {
        status: ListingStatus.ACTIVE,
        deletedAt: null,
        user: { deletedAt: null },
      },
    };

    const [favorites, total] = await this.prisma.$transaction([
      this.prisma.favoriteListing.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          listing: { include: listingPublicInclude as any },
        },
      }),
      this.prisma.favoriteListing.count({ where }),
    ]);

    const items = favorites.map((favorite) => {
      const { _count, ...listing } = favorite.listing as any;
      return {
        ...listing,
        favoritesCount: _count?.favoritedBy ?? 0,
        isFavorited: true,
      };
    });

    return { items, total, page, limit };
  }

  async addProviderFavorite(userId: string, providerId: string) {
    if (userId === providerId) {
      throw new BadRequestException('Cannot favorite yourself');
    }

    const provider = await this.prisma.user.findFirst({
      where: { id: providerId, deletedAt: null },
      select: { id: true },
    });

    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    const existing = await this.prisma.favoriteProvider.findUnique({
      where: { userId_providerId: { userId, providerId } },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException('Provider already favorited');
    }

    return this.prisma.favoriteProvider.create({
      data: { userId, providerId },
    });
  }

  async removeProviderFavorite(userId: string, providerId: string) {
    const existing = await this.prisma.favoriteProvider.findUnique({
      where: { userId_providerId: { userId, providerId } },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException('Favorite not found');
    }

    await this.prisma.favoriteProvider.delete({
      where: { userId_providerId: { userId, providerId } },
    });

    return { ok: true };
  }

  async listFavoriteProviders(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const activeListingFilter = {
      status: ListingStatus.ACTIVE,
      deletedAt: null,
    };
    const where = {
      userId,
      provider: { deletedAt: null },
    };

    const [favorites, total] = await this.prisma.$transaction([
      this.prisma.favoriteProvider.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          provider: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
              listing: {
                select: { category: true },
                where: activeListingFilter,
              },
              _count: {
                select: {
                  listing: { where: activeListingFilter },
                  favoritedBy: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.favoriteProvider.count({ where }),
    ]);

    const providerIds = favorites.map((favorite) => favorite.providerId);
    const reviewStats = new Map<
      string,
      { reviewsCount: number; ratingAvg: number | null }
    >();

    if (providerIds.length > 0) {
      const reviewAgg = await this.prisma.review.groupBy({
        by: ['targetUserId'],
        where: { targetUserId: { in: providerIds } },
        _count: { _all: true },
        _avg: { rating: true },
      });

      for (const row of reviewAgg) {
        reviewStats.set(row.targetUserId, {
          reviewsCount: row._count._all,
          ratingAvg: row._avg.rating ?? null,
        });
      }
    }

    const items = favorites.map((favorite) => {
      const provider = favorite.provider as any;
      const stats = reviewStats.get(provider.id);
      return {
        id: provider.id,
        firstName: provider.firstName,
        lastName: provider.lastName,
        avatarUrl: provider.avatarUrl || null,
        location: null,
        topCategory: this.getTopCategory(provider.listing),
        listingsCount: provider._count.listing,
        ratingAvg: stats?.ratingAvg ?? null,
        reviewsCount: stats?.reviewsCount ?? 0,
        favoritesCount: provider._count.favoritedBy ?? 0,
        isFavorited: true,
      };
    });

    return { items, total, page, limit };
  }

  async isListingFavorited(userId: string, listingId: string) {
    const existing = await this.prisma.favoriteListing.findUnique({
      where: { userId_listingId: { userId, listingId } },
      select: { id: true },
    });
    return Boolean(existing);
  }

  async isProviderFavorited(userId: string, providerId: string) {
    const existing = await this.prisma.favoriteProvider.findUnique({
      where: { userId_providerId: { userId, providerId } },
      select: { id: true },
    });
    return Boolean(existing);
  }
}
