import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NotificationType, OfferStatus, UserRole } from '@repo/shared';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { EmailService } from '../email/email.service';
import { renderTemplate } from '../notifications/notification-templates';
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
    private emailService: EmailService,
    private config: ConfigService,
  ) {}

  private get frontendUrl(): string {
    return (
      this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000'
    ).replace(/\/$/, '');
  }

  private listingTitle(listing: { description?: string | null }): string {
    return (listing.description ?? '').slice(0, 60) || 'Зар';
  }

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

    const existing = await this.prisma.offer.findFirst({
      where: { listingId, providerId: userId, status: 'PENDING' },
    });
    if (existing) {
      throw new ConflictException(
        'You already have a pending offer on this listing',
      );
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const offer = await this.prisma.offer.create({
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

    const providerName = [user.firstName, user.lastName]
      .filter(Boolean)
      .join(' ');
    await this.notifications.create({
      userId: listing.userId,
      type: NotificationType.NEW_OFFER,
      ...renderTemplate('NEW_OFFER', { providerName }),
    });

    this.emailService.dispatchToUserId(listing.userId, (recipient) =>
      this.emailService.sendNewOfferEmail(recipient, {
        providerName,
        listingTitle: this.listingTitle(offer.listing),
        offerAmount: offer.price,
        offerUrl: `${this.frontendUrl}/listings/${listingId}?offer=${offer.id}`,
      }),
    );

    return offer;
  }

  async findSent(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const where = { providerId: userId };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.offer.findMany({
        where,
        include: offerInclude,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.offer.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async findReceived(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const where = { listing: { userId, deletedAt: null } };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.offer.findMany({
        where,
        include: offerInclude,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.offer.count({ where }),
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

    return this.prisma.offer.findMany({
      where: { listingId },
      include: offerInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const offer = await this.prisma.offer.findUnique({
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
    const offer = await this.prisma.offer.findUnique({
      where: { id },
    });
    if (!offer) throw new NotFoundException('Offer not found');

    if (offer.providerId !== userId) {
      throw new ForbiddenException('Not your offer');
    }

    if (offer.status !== 'PENDING') {
      throw new BadRequestException('Only pending offers can be cancelled');
    }

    return this.prisma.offer.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: offerInclude,
    });
  }

  async accept(id: string, userId: string) {
    const offer = await this.prisma.offer.findUnique({
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
      this.prisma.offer.update({
        where: { id },
        data: { status: 'ACCEPTED', respondedAt: now },
        include: offerInclude,
      }),
      this.prisma.offer.updateMany({
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
          ...renderTemplate('OFFER_ACCEPTED', {}),
        },
      }),
    ]);

    const clientName = [
      offer.listing.userId,
    ].length > 0
      ? null
      : null;
    void clientName;

    this.emailService.dispatchToUserId(offer.providerId, async (recipient) => {
      const client = await this.prisma.user.findUnique({
        where: { id: offer.listing.userId },
        select: { firstName: true, lastName: true },
      });
      const clientFullName =
        [client?.firstName, client?.lastName].filter(Boolean).join(' ') ||
        'Захиалагч';
      return this.emailService.sendOfferAcceptedEmail(recipient, {
        clientName: clientFullName,
        listingTitle: this.listingTitle(offer.listing),
        offerUrl: `${this.frontendUrl}/listings/${offer.listing.id}?offer=${id}`,
      });
    });

    return updatedOffer;
  }

  async reject(id: string, userId: string) {
    const offer = await this.prisma.offer.findUnique({
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

    const updatedOffer = await this.prisma.offer.update({
      where: { id },
      data: { status: 'REJECTED', respondedAt: new Date() },
      include: offerInclude,
    });

    await this.notifications.create({
      userId: offer.providerId,
      type: NotificationType.OFFER_REJECTED,
      ...renderTemplate('OFFER_REJECTED', {}),
    });

    const rejectedListing = await this.prisma.listing.findUnique({
      where: { id: offer.listingId },
      select: { description: true },
    });
    this.emailService.dispatchToUserId(offer.providerId, (recipient) =>
      this.emailService.sendOfferRejectedEmail(recipient, {
        listingTitle: this.listingTitle(rejectedListing ?? { description: null }),
      }),
    );

    return updatedOffer;
  }

  async complete(id: string, userId: string, dto?: CompleteOfferDto) {
    const offer = await this.prisma.offer.findUnique({
      where: { id },
      include: {
        listing: { select: { userId: true, description: true } },
        provider: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    if (!offer) throw new NotFoundException('Offer not found');

    const clientId: string = offer.listing.userId;

    if (clientId !== userId) {
      throw new ForbiddenException('Not your listing');
    }

    if (offer.status !== OfferStatus.ACCEPTED) {
      throw new BadRequestException('Only accepted offers can be completed');
    }

    const completedOffer = await this.prisma.offer.update({
      where: { id },
      data: {
        status: OfferStatus.COMPLETED,
        completedAt: new Date(),
        clientNote: dto?.clientNote ?? null,
      },
      include: offerInclude,
    });

    const reviewLink = '/reviews/create?offerId=' + id;
    const providerName = [offer.provider.firstName, offer.provider.lastName]
      .filter(Boolean)
      .join(' ');

    const client = await this.prisma.user.findUnique({
      where: { id: clientId },
      select: { firstName: true, lastName: true },
    });
    const clientName = [client?.firstName, client?.lastName]
      .filter(Boolean)
      .join(' ');

    await Promise.all([
      this.notifications.create({
        userId: clientId,
        type: NotificationType.REVIEW_REQUESTED,
        ...renderTemplate('REVIEW_REQUESTED', {
          partnerName: providerName,
          reviewLink,
        }),
      }),
      this.notifications.create({
        userId: offer.providerId,
        type: NotificationType.REVIEW_REQUESTED,
        ...renderTemplate('REVIEW_REQUESTED', {
          partnerName: clientName,
          reviewLink,
        }),
      }),
    ]);

    const reviewUrl = `${this.frontendUrl}${reviewLink}`;
    this.emailService.dispatchToUserId(clientId, (recipient) =>
      this.emailService.sendOfferCompletedEmail(recipient, {
        otherPartyName: providerName || 'Үйлчилгээ үзүүлэгч',
        listingTitle: this.listingTitle(offer.listing),
        reviewUrl,
      }),
    );
    this.emailService.dispatchToUserId(offer.providerId, (recipient) =>
      this.emailService.sendOfferCompletedEmail(recipient, {
        otherPartyName: clientName || 'Захиалагч',
        listingTitle: this.listingTitle(offer.listing),
        reviewUrl,
      }),
    );

    return completedOffer;
  }

  private async listHistory(where: Prisma.OfferWhereInput, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.offer.findMany({
        where,
        include: offerInclude,
        orderBy: { completedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.offer.count({ where }),
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
      this.prisma.offer.aggregate({
        where: { status: OfferStatus.COMPLETED, listing: { userId } },
        _count: { _all: true },
        _sum: { price: true },
      }),
      this.prisma.offer.aggregate({
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
