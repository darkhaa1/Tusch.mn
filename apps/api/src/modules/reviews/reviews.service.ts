import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NotificationType, OfferStatus } from '@repo/shared';
import { PrismaService } from '../../database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { EmailService } from '../email/email.service';
import { CreateReviewDto } from './dto/create-review.dto';

const REVIEW_WINDOW_DAYS = 30;

@Injectable()
export class ReviewsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private emailService: EmailService,
    private config: ConfigService,
  ) {}

  private get frontendUrl(): string {
    return (
      this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000'
    ).replace(/\/$/, '');
  }

  private reviewInclude = {
    reviewer: {
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
      },
    },
  } as const;

  async create(dto: CreateReviewDto, reviewerId: string) {
    const offer = await (this.prisma as any).offer.findUnique({
      where: { id: dto.offerId },
      include: {
        listing: { select: { id: true, userId: true, description: true } },
        provider: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    if (offer.status !== OfferStatus.COMPLETED) {
      throw new ForbiddenException(
        'Reviews can only be submitted for completed offers',
      );
    }

    const clientId: string = offer.listing.userId;
    const providerId: string = offer.providerId;
    if (reviewerId !== clientId && reviewerId !== providerId) {
      throw new ForbiddenException('You are not a party to this offer');
    }

    const targetUserId = reviewerId === clientId ? providerId : clientId;
    if (targetUserId === reviewerId) {
      throw new BadRequestException('Cannot review yourself');
    }

    if (offer.completedAt) {
      const deadline = new Date(offer.completedAt);
      deadline.setDate(deadline.getDate() + REVIEW_WINDOW_DAYS);
      if (new Date() > deadline) {
        throw new ForbiddenException(
          'Reviews must be submitted within ' + REVIEW_WINDOW_DAYS + ' days of completion',
        );
      }
    }

    const existing = await this.prisma.review.findUnique({
      where: { reviewerId_offerId: { reviewerId, offerId: dto.offerId } },
    });
    if (existing) {
      throw new ConflictException('You have already reviewed this offer');
    }

    const review = await this.prisma.review.create({
      data: {
        offerId: dto.offerId,
        targetUserId,
        reviewerId,
        rating: dto.rating,
        comment: dto.comment,
      },
      include: this.reviewInclude as any,
    });

    const reviewer = await this.prisma.user.findUnique({
      where: { id: reviewerId },
      select: { firstName: true, lastName: true },
    });
    const reviewerName =
      [reviewer?.firstName, reviewer?.lastName].filter(Boolean).join(' ').trim() ||
      'Someone';

    await this.notificationsService.create({
      userId: targetUserId,
      type: NotificationType.NEW_REVIEW,
      title: 'Vous avez recu un avis',
      body: reviewerName + ' vous a laisse un avis.',
    });

    this.emailService.dispatchToUserId(targetUserId, (recipient) =>
      this.emailService.sendNewReviewEmail(recipient, {
        fromUserName: reviewerName,
        rating: dto.rating,
        commentSnippet: dto.comment,
        profileUrl: `${this.frontendUrl}/u/${targetUserId}`,
      }),
    );

    return review;
  }

  async checkReview(offerId: string, reviewerId: string) {
    const review = await this.prisma.review.findUnique({
      where: { reviewerId_offerId: { reviewerId, offerId } },
      select: { id: true },
    });
    return { reviewed: !!review };
  }

  async findByTargetUser(targetUserId: string, page: number, limit: number) {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(50, Math.max(1, limit));
    const skip = (safePage - 1) * safeLimit;

    const targetUser = await this.prisma.user.findFirst({
      where: { id: targetUserId, deletedAt: null },
      select: { id: true },
    });

    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.review.findMany({
        where: { targetUserId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: safeLimit,
        include: this.reviewInclude as any,
      }),
      this.prisma.review.count({ where: { targetUserId } }),
    ]);

    return {
      items,
      total,
      page: safePage,
      limit: safeLimit,
    };
  }

  async delete(reviewId: string, userId: string) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.reviewerId !== userId) {
      throw new ForbiddenException('Not your review');
    }

    await this.prisma.review.delete({ where: { id: reviewId } });

    return { ok: true };
  }
}
