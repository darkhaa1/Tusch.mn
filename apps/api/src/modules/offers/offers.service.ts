import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NotificationType, OfferStatus, UserRole } from '@repo/shared';
import { PrismaService } from '../../database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { CompleteOfferDto } from './dto/complete-offer.dto';

const offerInclude = {
  provider: {
    select: { id: true, firstName: true, lastName: true, avatarUrl: true },
  },
  listing: {
    select: {
      id: true,
      description: true,
      price: true,
      userId: true,
      category: true,
      location: true,
    },
  },
} as const;

@Injectable()
export class OffersService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  async create(listingId: string, dto: CreateOfferDto, userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, firstName: true, lastName: true },
    });

    if (
      !user ||
      (user.role !== UserRole.PROVIDER && user.role !== UserRole.BOTH)
    ) {
      throw new ForbiddenException(
        'Only providers can create offers',
      );
    }

    const listing = await this.prisma.listing.findFirst({
      where: { id: listingId, deletedAt: null },
    });
    if (!listing) throw new NotFoundException('Listing not found');

    if (listing.userId === userId) {
      throw new BadRequestException(
        'Cannot create an offer on your own listing',
      );
    }

    const existing = await (this.prisma as any).offer.findFirst({
      where: { listingId, providerId: userId, status: 'PENDING' },
    });
    if (existing) {
      throw new ConflictException(
        'You already have a pending offer on this listing',
      );
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const offer = await (this.prisma as any).offer.create({
      data: {
        listingId,
        providerId: userId,
        price: dto.price,
        message: dto.message,
        estimatedDays: dto.estimatedDays,
        expiresAt,
      },
      include: offerInclude,
    });

    await this.notifications.create({
      userId: listing.userId,
      type: NotificationType.NEW_OFFER as any,
      title: 'Nouvelle offre',
      body: `${user.firstName} ${user.lastName} a fait une offre sur votre annonce`,
    });

    return offer;
  }

  async findSent(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const where = { providerId: userId };

    const [items, total] = await this.prisma.$transaction([
      (this.prisma as any).offer.findMany({
        where,
        include: offerInclude,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      (this.prisma as any).offer.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async findReceived(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const where = { listing: { userId, deletedAt: null } };

    const [items, total] = await this.prisma.$transaction([
      (this.prisma as any).offer.findMany({
        where,
        include: offerInclude,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      (this.prisma as any).offer.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async findByListing(listingId: string, userId: string) {
    const listing = await this.prisma.listing.findFirst({
      where: { id: listingId, deletedAt: null },
    });
    if (!listing) throw new NotFoundException('Listing not found');

    if (listing.userId !== userId) {
      throw new ForbiddenException('Not your listing');
    }

    return (this.prisma as any).offer.findMany({
      where: { listingId },
      include: offerInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const offer = await (this.prisma as any).offer.findUnique({
      where: { id },
      include: offerInclude,
    });
    if (!offer) throw new NotFoundException('Offer not found');

    if (offer.providerId !== userId && offer.listing.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return offer;
  }

  async cancel(id: string, userId: string) {
    const offer = await (this.prisma as any).offer.findUnique({
      where: { id },
    });
    if (!offer) throw new NotFoundException('Offer not found');

    if (offer.providerId !== userId) {
      throw new ForbiddenException('Not your offer');
    }

    if (offer.status !== 'PENDING') {
      throw new BadRequestException('Only pending offers can be cancelled');
    }

    return (this.prisma as any).offer.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: offerInclude,
    });
  }

  async accept(id: string, userId: string) {
    const offer = await (this.prisma as any).offer.findUnique({
      where: { id },
      include: {
        listing: { select: { id: true, userId: true, description: true } },
        provider: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    if (!offer) throw new NotFoundException('Offer not found');

    if (offer.listing.userId !== userId) {
      throw new ForbiddenException('Not your listing');
    }

    if (offer.status !== 'PENDING') {
      throw new BadRequestException('Only pending offers can be accepted');
    }

    const now = new Date();
    const [updatedOffer] = await this.prisma.$transaction([
      (this.prisma as any).offer.update({
        where: { id },
        data: { status: 'ACCEPTED', respondedAt: now },
        include: offerInclude,
      }),
      (this.prisma as any).offer.updateMany({
        where: {
          listingId: offer.listingId,
          status: 'PENDING',
          id: { not: id },
        },
        data: { status: 'REJECTED', respondedAt: now },
      }),
      this.prisma.message.create({
        data: {
          senderId: userId,
          recipientId: offer.providerId,
          listingId: offer.listingId,
          content: 'Your offer was accepted. You can now chat.',
        },
      }),
      this.prisma.notification.create({
        data: {
          userId: offer.providerId,
          type: NotificationType.OFFER_ACCEPTED,
          title: 'Offer accepted',
          body: 'Your offer has been accepted.',
        },
      }),
    ]);

    return updatedOffer;
  }

  async reject(id: string, userId: string) {
    const offer = await (this.prisma as any).offer.findUnique({
      where: { id },
      include: { listing: { select: { userId: true } } },
    });
    if (!offer) throw new NotFoundException('Offer not found');

    if (offer.listing.userId !== userId) {
      throw new ForbiddenException('Not your listing');
    }

    if (offer.status !== 'PENDING') {
      throw new BadRequestException('Only pending offers can be rejected');
    }

    const updatedOffer = await (this.prisma as any).offer.update({
      where: { id },
      data: { status: 'REJECTED', respondedAt: new Date() },
      include: offerInclude,
    });

    await this.notifications.create({
      userId: offer.providerId,
      type: NotificationType.OFFER_REJECTED,
      title: 'Offer rejected',
      body: 'Your offer has been rejected.',
    });

    return updatedOffer;
  }

  async complete(id: string, userId: string, dto?: CompleteOfferDto) {
    const offer = await (this.prisma as any).offer.findUnique({
      where: { id },
      include: { listing: { select: { userId: true } } },
    });
    if (!offer) throw new NotFoundException('Offer not found');

    if (offer.listing.userId !== userId) {
      throw new ForbiddenException('Not your listing');
    }

    if (offer.status !== OfferStatus.ACCEPTED) {
      throw new BadRequestException('Only accepted offers can be completed');
    }

    return (this.prisma as any).offer.update({
      where: { id },
      data: {
        status: OfferStatus.COMPLETED,
        completedAt: new Date(),
        clientNote: dto?.clientNote ?? null,
      },
      include: offerInclude,
    });
  }

  private async listHistory(where: any, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [items, total] = await this.prisma.$transaction([
      (this.prisma as any).offer.findMany({
        where,
        include: offerInclude,
        orderBy: { completedAt: 'desc' },
        skip,
        take: limit,
      }),
      (this.prisma as any).offer.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async findHistory(userId: string, page: number, limit: number) {
    return this.listHistory(
      {
        status: OfferStatus.COMPLETED,
        OR: [{ providerId: userId }, { listing: { userId } }],
      },
      page,
      limit,
    );
  }

  async findHistoryAsClient(userId: string, page: number, limit: number) {
    return this.listHistory(
      { status: OfferStatus.COMPLETED, listing: { userId } },
      page,
      limit,
    );
  }

  async findHistoryAsProvider(userId: string, page: number, limit: number) {
    return this.listHistory(
      { status: OfferStatus.COMPLETED, providerId: userId },
      page,
      limit,
    );
  }

  async getStats(userId: string) {
    const [clientAgg, providerAgg] = await Promise.all([
      (this.prisma as any).offer.aggregate({
        where: { status: OfferStatus.COMPLETED, listing: { userId } },
        _count: { _all: true },
        _sum: { price: true },
      }),
      (this.prisma as any).offer.aggregate({
        where: { status: OfferStatus.COMPLETED, providerId: userId },
        _count: { _all: true },
        _sum: { price: true },
        _avg: { price: true },
      }),
    ]);

    const averagePrice = providerAgg._avg?.price
      ? Math.round(providerAgg._avg.price)
      : 0;

    return {
      asClient: {
        totalCompleted: clientAgg._count?._all ?? 0,
        totalSpent: clientAgg._sum?.price ?? 0,
      },
      asProvider: {
        totalCompleted: providerAgg._count?._all ?? 0,
        totalEarned: providerAgg._sum?.price ?? 0,
        averagePrice,
      },
    };
  }
}
