import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

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
        this.prisma.listing.count({ where: { userId } }),
        this.prisma.listing.findMany({
          where: { userId },
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
