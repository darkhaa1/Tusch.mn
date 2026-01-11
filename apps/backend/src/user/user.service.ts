import { Injectable, NotFoundException } from '@nestjs/common';
import { ListingStatus, Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ProviderCardDto, ProvidersResponseDto } from './dto/provider-card.dto';

export type PublicUserProfile = {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
    createdAt: Date;
    verification: {
      emailVerified: boolean;
      phoneVerified: boolean;
      idVerified: boolean;
    };
  };
  stats: {
    listingsCount: number;
    completedCount: number | null;
    responseRate: number | null;
    ratingAvg: number | null;
    reviewsCount: number;
  };
  recentListings: Array<{
    id: string;
    category: string | null;
    price: number;
    location: string | null;
    description: string;
    createdAt: Date;
    imageUrl: string | null;
  }>;
  reviews: Array<{
    id: string;
    rating: number;
    comment: string | null;
    createdAt: Date;
    reviewer: {
      id: string;
      firstName: string;
      lastName: string;
      avatarUrl: string | null;
    };
  }>;
};

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async createUser(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    accountType: string;
    avatarUrl?: string | null;
  }) {
    return this.prisma.user.create({ data });
  }

  async findAll() {
    const users = await this.prisma.user.findMany();
    return users.map((user) => this.sanitizeUser(user));
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return this.sanitizeUser(user);
  }

  async updateUser(
    id: string,
    data: Partial<{
      email: string;
      firstName: string;
      lastName: string;
      phone: string;
      accountType: string;
      avatarUrl: string | null;
      role?: UserRole;
    }>,
  ) {
    const updated = await this.prisma.user.update({
      where: { id },
      data,
    });
    return this.sanitizeUser(updated);
  }

  async deleteUser(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }

  async updateMyRole(userId: string, role: UserRole) {
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { role },
    });
    return this.sanitizeUser(updated);
  }

  sanitizeUser(user: any) {
    if (!user) return null;
    const { password: _password, ...rest } = user;
    void _password;
    return rest;
  }

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

  async getProviders(params?: {
    q?: string;
    category?: string;
    page?: number;
    limit?: number;
  }): Promise<ProvidersResponseDto> {
    const page = Math.max(1, params?.page ?? 1);
    const limit = Math.min(50, Math.max(1, params?.limit ?? 12));
    const skip = (page - 1) * limit;
    const category = params?.category?.trim();
    const q = params?.q?.trim();

    const activeListingFilter = { status: ListingStatus.ACTIVE };
    const andFilters: Prisma.UserWhereInput[] = [
      { listing: { some: activeListingFilter } },
    ];

    if (category) {
      andFilters.push({
        listing: { some: { ...activeListingFilter, category } },
      });
    }

    if (q) {
      andFilters.push({
        OR: [
          { firstName: { contains: q, mode: 'insensitive' } },
          { lastName: { contains: q, mode: 'insensitive' } },
        ],
      });
    }

    const where: Prisma.UserWhereInput = { AND: andFilters };

    const [total, users] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
          listing: {
            select: { category: true },
            where: category
              ? { category, status: ListingStatus.ACTIVE }
              : activeListingFilter,
          },
          _count: { select: { listing: true } },
        },
      }),
    ]);

    const userIds = users.map((user) => user.id);
    const reviewStats = new Map<
      string,
      { reviewsCount: number; ratingAvg: number | null }
    >();

    if (userIds.length > 0) {
      const reviewAgg = await this.prisma.review.groupBy({
        by: ['targetUserId'],
        where: { targetUserId: { in: userIds } },
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

    const items: ProviderCardDto[] = users.map((user) => {
      const stats = reviewStats.get(user.id);
      return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl || null,
        location: null,
        topCategory: this.getTopCategory(user.listing),
        listingsCount: user._count.listing,
        ratingAvg: stats?.ratingAvg ?? null,
        reviewsCount: stats?.reviewsCount ?? 0,
      };
    });

    return {
      items,
      total,
      page,
      limit,
    };
  }

  async getPublicProfile(
    userId: string,
    params?: { page?: number; limit?: number },
  ): Promise<PublicUserProfile> {
    const safeUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    if (!safeUser) {
      throw new NotFoundException('User not found');
    }

    const page = Math.max(1, params?.page || 1);
    const limit = Math.min(20, Math.max(1, params?.limit || 10));
    const skip = (page - 1) * limit;

    const [listingsCount, recentListings, reviewAgg, reviews] =
      await Promise.all([
        this.prisma.listing.count({
          where: { userId, status: ListingStatus.ACTIVE },
        }),
        this.prisma.listing.findMany({
          where: { userId, status: ListingStatus.ACTIVE },
          orderBy: { createdAt: 'desc' },
          take: 6,
          select: {
            id: true,
            category: true,
            price: true,
            location: true,
            description: true,
            createdAt: true,
            images: {
              orderBy: { position: 'asc' },
              take: 1,
              select: { url: true },
            },
          },
        }),
        this.prisma.review.aggregate({
          where: { targetUserId: userId },
          _count: { _all: true },
          _avg: { rating: true },
        }),
        this.prisma.review.findMany({
          where: { targetUserId: userId },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            reviewer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
        }),
      ]);

    const recentListingsSafe = recentListings.map((listing) => ({
      id: listing.id,
      category: listing.category,
      price: listing.price,
      location: listing.location,
      description: listing.description,
      createdAt: listing.createdAt,
      imageUrl: listing.images?.[0]?.url || null,
    }));

    return {
      user: {
        ...safeUser,
        avatarUrl: safeUser.avatarUrl || null,
        verification: {
          emailVerified: false,
          phoneVerified: false,
          idVerified: false,
        },
      },
      stats: {
        listingsCount,
        completedCount: null,
        responseRate: null,
        ratingAvg: reviewAgg._avg.rating ?? null,
        reviewsCount: reviewAgg._count._all,
      },
      recentListings: recentListingsSafe,
      reviews: reviews.map((review) => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment || null,
        createdAt: review.createdAt,
        reviewer: {
          id: review.reviewer.id,
          firstName: review.reviewer.firstName,
          lastName: review.reviewer.lastName,
          avatarUrl: review.reviewer.avatarUrl || null,
        },
      })),
    };
  }
}
