import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ListingStatus, MN_CITY_SET, MN_DISTRICT_MAP, UserRole, VerificationStatus } from '@repo/shared';
import { PrismaService } from '../../database/prisma.service';
import { ProviderCardDto, ProvidersResponseDto } from './dto/provider-card.dto';

export type PublicUserProfile = {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
    createdAt: Date;
    favoritesCount: number;
    isFavorited: boolean;
    serviceZones: Array<{ id: string; userId: string; city: string; district: string | null; createdAt: Date }>;
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
    thumbnailUrl: string | null;
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

  private static readonly safeUserSelect = {
    id: true,
    email: true,
    firstName: true,
    lastName: true,
    avatarUrl: true,
    role: true,
    phone: true,
    createdAt: true,
    status: true,
    emailVerified: true,
  } as const;

  async findAll(params?: { page?: number; limit?: number; search?: string }) {
    const page = Math.max(1, params?.page ?? 1);
    const limit = Math.min(50, Math.max(1, params?.limit ?? 20));
    const search = params?.search?.trim();

    const where: Prisma.UserWhereInput = {
      deletedAt: null,
      ...(search
        ? {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: UserService.safeUserSelect,
      }),
      this.prisma.user.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async findById(id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
    });
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
    return this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async updateMyRole(userId: string, role: UserRole) {
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { role },
    });
    return this.sanitizeUser(updated);
  }

  async completeOnboarding(
    userId: string,
    data: {
      role?: UserRole;
      city?: string;
      bio?: string;
      serviceCategories?: string[];
      serviceZones?: string[];
    },
  ) {
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...data,
        onboardingCompletedAt: new Date(),
      },
    });
    return this.sanitizeUser(updated);
  }

  sanitizeUser(user: any) {
    if (!user) return null;
    const {
      password: _password,
      resetToken: _resetToken,
      resetTokenExp: _resetTokenExp,
      emailVerifyToken: _emailVerifyToken,
      emailVerifyTokenExp: _emailVerifyTokenExp,
      verificationDocumentUrl: _verificationDocumentUrl,
      ...rest
    } = user;
    void _password;
    void _resetToken;
    void _resetTokenExp;
    void _emailVerifyToken;
    void _emailVerifyTokenExp;
    void _verificationDocumentUrl;
    return rest;
  }

  async getVerificationStatus(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: {
        verificationStatus: true,
        verificationRejectedReason: true,
        verifiedAt: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return {
      status: user.verificationStatus,
      rejectedReason: user.verificationRejectedReason,
      verifiedAt: user.verifiedAt,
    };
  }

  async submitVerification(userId: string, documentFilename: string) {
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        verificationStatus: VerificationStatus.PENDING,
        verificationDocumentUrl: documentFilename,
        verificationRejectedReason: null,
      },
      select: { verificationStatus: true },
    });
    return { status: updated.verificationStatus };
  }

  async updateServiceZones(
    userId: string,
    zones: { city: string; district?: string }[],
  ) {
    for (const zone of zones) {
      if (!MN_CITY_SET.has(zone.city)) {
        throw new BadRequestException(
          `City "${zone.city}" is not in the reference list`,
        );
      }
      if (zone.district) {
        const districtSet = MN_DISTRICT_MAP.get(zone.city);
        if (!districtSet || !districtSet.has(zone.district)) {
          throw new BadRequestException(
            `District "${zone.district}" is not valid for city "${zone.city}"`,
          );
        }
      }
    }

    await this.prisma.$transaction([
      this.prisma.serviceZone.deleteMany({ where: { userId } }),
      this.prisma.serviceZone.createMany({
        data: zones.map((z) => ({
          userId,
          city: z.city,
          district: z.district ?? null,
        })),
      }),
    ]);

    return this.prisma.serviceZone.findMany({
      where: { userId },
      orderBy: [{ city: 'asc' }, { district: 'asc' }],
    });
  }

  async getServiceZones(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: { id: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return this.prisma.serviceZone.findMany({
      where: { userId },
      orderBy: [{ city: 'asc' }, { district: 'asc' }],
    });
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

  async getProviders(
    params?: {
      q?: string;
      category?: string;
      city?: string;
      verified?: boolean;
      page?: number;
      limit?: number;
    },
    viewerId?: string,
  ): Promise<ProvidersResponseDto> {
    const page = Math.max(1, params?.page ?? 1);
    const limit = Math.min(50, Math.max(1, params?.limit ?? 12));
    const skip = (page - 1) * limit;
    const category = params?.category?.trim();
    const q = params?.q?.trim();

    const activeListingFilter = {
      status: ListingStatus.ACTIVE,
      deletedAt: null,
    };
    const andFilters: Prisma.UserWhereInput[] = [
      { deletedAt: null },
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

    if (params?.city) {
      andFilters.push({
        zones: { some: { city: params.city } },
      });
    }

    if (params?.verified) {
      andFilters.push({ verificationStatus: VerificationStatus.VERIFIED });
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
          verificationStatus: true,
          listing: {
            select: { category: true },
            where: category
              ? { category, status: ListingStatus.ACTIVE, deletedAt: null }
              : activeListingFilter,
          },
          ...(viewerId
            ? {
                favoritedBy: {
                  where: { userId: viewerId },
                  select: { id: true },
                },
              }
            : {}),
          _count: {
            select: {
              listing: { where: activeListingFilter },
              favoritedBy: true,
            },
          },
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
      const favoritesCount = user._count?.favoritedBy ?? 0;
      const isFavorited = viewerId
        ? (user.favoritedBy?.length ?? 0) > 0
        : false;
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
        favoritesCount,
        isFavorited,
        isVerified: user.verificationStatus === VerificationStatus.VERIFIED,
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
    params?: { page?: number; limit?: number; viewerId?: string },
  ): Promise<PublicUserProfile> {
    const viewerId = params?.viewerId;
    const safeUser = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        createdAt: true,
        emailVerified: true,
        verificationStatus: true,
        _count: { select: { favoritedBy: true } },
        ...(viewerId
          ? {
              favoritedBy: {
                where: { userId: viewerId },
                select: { id: true },
              },
            }
          : {}),
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
          where: { userId, status: ListingStatus.ACTIVE, deletedAt: null },
        }),
        this.prisma.listing.findMany({
          where: { userId, status: ListingStatus.ACTIVE, deletedAt: null },
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
              select: { url: true, thumbnailUrl: true },
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
      thumbnailUrl: listing.images?.[0]?.thumbnailUrl || null,
    }));

    const favoritesCount = safeUser._count?.favoritedBy ?? 0;
    const isFavorited = viewerId
      ? (safeUser.favoritedBy?.length ?? 0) > 0
      : false;
    const serviceZones = await this.prisma.serviceZone.findMany({
      where: { userId },
      orderBy: [{ city: 'asc' }, { district: 'asc' }],
    });

    const { _count, favoritedBy, verificationStatus, ...safeUserBase } = safeUser;
    void _count;
    void favoritedBy;

    return {
      user: {
        ...safeUserBase,
        avatarUrl: safeUserBase.avatarUrl || null,
        favoritesCount,
        isFavorited,
        serviceZones,
        verification: {
          emailVerified: safeUserBase.emailVerified,
          phoneVerified: false,
          idVerified: verificationStatus === VerificationStatus.VERIFIED,
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
