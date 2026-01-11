import { Injectable, NotFoundException } from '@nestjs/common';
import { ListingStatus, Prisma, UserStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AdminUsersQueryDto } from './dto/admin-users-query.dto';
import { AdminListingsQueryDto } from './dto/admin-listings-query.dto';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const [
      usersTotal,
      usersSuspended,
      listingsTotal,
      listingsHidden,
      messagesTotal,
      reviewsTotal,
    ] = await this.prisma.$transaction([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { status: UserStatus.SUSPENDED } }),
      this.prisma.listing.count(),
      this.prisma.listing.count({
        where: { status: ListingStatus.HIDDEN },
      }),
      this.prisma.message.count(),
      this.prisma.review.count(),
    ]);

    return {
      usersTotal,
      usersSuspended,
      listingsTotal,
      listingsHidden,
      messagesTotal,
      reviewsTotal,
    };
  }

  async getUsers(query: AdminUsersQueryDto) {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(50, Math.max(1, query.limit ?? 20));
    const skip = (page - 1) * limit;
    const q = query.q?.trim();

    const where: Prisma.UserWhereInput = {
      ...(query.status ? { status: query.status } : {}),
      ...(q
        ? {
            OR: [
              { firstName: { contains: q, mode: 'insensitive' } },
              { lastName: { contains: q, mode: 'insensitive' } },
              { email: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          status: true,
          isAdmin: true,
          createdAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async updateUserStatus(adminId: string, targetId: string, status: UserStatus) {
    const existing = await this.prisma.user.findUnique({
      where: { id: targetId },
      select: { id: true },
    });
    if (!existing) throw new NotFoundException('User not found');

    const [updated] = await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: targetId },
        data: { status },
        select: {
          id: true,
          status: true,
          isAdmin: true,
        },
      }),
      this.prisma.adminActionLog.create({
        data: {
          adminId,
          action: 'USER_STATUS_UPDATE',
          targetType: 'User',
          targetId,
          meta: { status },
        },
      }),
    ]);

    return updated;
  }

  async getListings(query: AdminListingsQueryDto) {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(50, Math.max(1, query.limit ?? 20));
    const skip = (page - 1) * limit;
    const q = query.q?.trim();

    const where: Prisma.ListingWhereInput = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.category ? { category: query.category } : {}),
      ...(q
        ? {
            OR: [
              { description: { contains: q, mode: 'insensitive' } },
              { location: { contains: q, mode: 'insensitive' } },
              { category: { contains: q, mode: 'insensitive' } },
              {
                user: {
                  OR: [
                    { firstName: { contains: q, mode: 'insensitive' } },
                    { lastName: { contains: q, mode: 'insensitive' } },
                  ],
                },
              },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.listing.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          category: true,
          price: true,
          location: true,
          description: true,
          status: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      this.prisma.listing.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async updateListingStatus(
    adminId: string,
    targetId: string,
    status: ListingStatus,
  ) {
    const existing = await this.prisma.listing.findUnique({
      where: { id: targetId },
      select: { id: true },
    });
    if (!existing) throw new NotFoundException('Listing not found');

    const [updated] = await this.prisma.$transaction([
      this.prisma.listing.update({
        where: { id: targetId },
        data: { status },
        select: {
          id: true,
          status: true,
        },
      }),
      this.prisma.adminActionLog.create({
        data: {
          adminId,
          action: 'LISTING_STATUS_UPDATE',
          targetType: 'Listing',
          targetId,
          meta: { status },
        },
      }),
    ]);

    return updated;
  }
}
