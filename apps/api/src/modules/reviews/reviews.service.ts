import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NotificationType } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

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
    // Business rule: Prevent self-review
    if (dto.targetUserId === reviewerId) {
      throw new BadRequestException('Cannot review yourself');
    }

    // Validate: Both users exist
    const [targetUser, reviewer] = await Promise.all([
      this.prisma.user.findFirst({
        where: { id: dto.targetUserId, deletedAt: null },
        select: { id: true },
      }),
      this.prisma.user.findFirst({
        where: { id: reviewerId, deletedAt: null },
        select: { id: true, firstName: true, lastName: true },
      }),
    ]);

    if (!targetUser) {
      throw new NotFoundException('Target user not found');
    }
    if (!reviewer) {
      throw new NotFoundException('Reviewer not found');
    }

    // Business rule: Check for duplicate review
    const existingReview = await this.prisma.review.findUnique({
      where: {
        targetUserId_reviewerId: {
          targetUserId: dto.targetUserId,
          reviewerId: reviewerId,
        },
      },
    });

    if (existingReview) {
      throw new ConflictException('You have already reviewed this user');
    }

    // Create review
    const review = await this.prisma.review.create({
      data: {
        targetUserId: dto.targetUserId,
        reviewerId: reviewerId,
        rating: dto.rating,
        comment: dto.comment || null,
      },
      include: this.reviewInclude as any,
    });

    const reviewerName =
      [reviewer.firstName, reviewer.lastName].filter(Boolean).join(' ').trim() ||
      'A user';
    await this.notificationsService.create({
      userId: dto.targetUserId,
      type: NotificationType.NEW_REVIEW,
      title: 'New review',
      body: `${reviewerName} left you a review.`,
    });

    return review;
  }

  async findByTargetUser(targetUserId: string, page: number, limit: number) {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(50, Math.max(1, limit));
    const skip = (safePage - 1) * safeLimit;

    // Validate target user exists
    const targetUser = await this.prisma.user.findFirst({
      where: { id: targetUserId, deletedAt: null },
      select: { id: true },
    });

    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    // Use $transaction for parallel queries
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

    // Ownership check
    if (review.reviewerId !== userId) {
      throw new ForbiddenException('Not your review');
    }

    await this.prisma.review.delete({ where: { id: reviewId } });

    return { ok: true };
  }
}
