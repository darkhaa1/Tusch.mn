import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NotificationType } from '@repo/shared';
import { PrismaService } from '../../database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { EmailService } from '../email/email.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessagesService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private emailService: EmailService,
    private config: ConfigService,
  ) {}

  private get frontendUrl(): string {
    return (this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000').replace(
      /\/$/,
      '',
    );
  }

  private userSelect = {
    id: true,
    email: true,
    firstName: true,
    lastName: true,
    phone: true,
    avatarUrl: true,
  };

  async create(dto: CreateMessageDto, senderId: string) {
    if (dto.recipientId === senderId) {
      throw new BadRequestException('Cannot send message to yourself');
    }

    const [recipient, listing, sender] = await this.prisma.$transaction([
      this.prisma.user.findFirst({
        where: { id: dto.recipientId, deletedAt: null },
        select: { id: true },
      }),
      this.prisma.listing.findFirst({
        where: { id: dto.listingId, deletedAt: null },
        select: { id: true },
      }),
      this.prisma.user.findFirst({
        where: { id: senderId, deletedAt: null },
        select: { firstName: true, lastName: true },
      }),
    ]);

    if (!recipient) {
      throw new NotFoundException('Recipient not found');
    }
    if (!listing) {
      throw new NotFoundException('Listing not found');
    }
    if (!sender) {
      throw new NotFoundException('Sender not found');
    }

    const message = await this.prisma.message.create({
      data: {
        content: dto.content,
        sender: { connect: { id: senderId } },
        recipient: { connect: { id: dto.recipientId } },
        listing: { connect: { id: dto.listingId } },
      },
    });

    const senderName =
      [sender.firstName, sender.lastName].filter(Boolean).join(' ').trim() ||
      'another user';
    await this.notificationsService.create({
      userId: dto.recipientId,
      type: NotificationType.NEW_MESSAGE,
      title: 'New message',
      body: `You received a message from ${senderName}.`,
    });

    // Email is best-effort: notification UX must not depend on Resend.
    this.emailService.dispatchToUserId(dto.recipientId, (recipient) =>
      this.emailService.sendNewMessageEmail(recipient, {
        fromUserName: senderName,
        preview: dto.content,
        conversationUrl: `${this.frontendUrl}/messages?userId=${senderId}`,
      }),
    );

    return message;
  }

  async getConversation(
    userId: string,
    otherUserId: string,
    page = 1,
    limit = 30,
  ) {
    const where = {
      OR: [
        { senderId: userId, recipientId: otherUserId },
        { senderId: otherUserId, recipientId: userId },
      ],
    };

    const include = {
      sender: { select: this.userSelect },
      recipient: { select: this.userSelect },
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.message.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include,
      }),
      this.prisma.message.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      hasMore: page * limit < total,
    };
  }

  async getThreads(userId: string) {
    const messages = await this.prisma.message.findMany({
      where: { OR: [{ senderId: userId }, { recipientId: userId }] },
      orderBy: { createdAt: 'desc' },
      include: {
        sender: { select: this.userSelect },
        recipient: { select: this.userSelect },
      },
    });

    const lastByPartner = new Map<string, (typeof messages)[number]>();
    for (const message of messages) {
      const partnerId =
        message.senderId === userId ? message.recipientId : message.senderId;
      if (!lastByPartner.has(partnerId)) {
        lastByPartner.set(partnerId, message);
      }
    }

    return Array.from(lastByPartner.values());
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.message.count({
      where: { recipientId: userId, readAt: null },
    });
  }

  async markAsRead(messageId: string, userId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }
    if (message.recipientId !== userId) {
      throw new ForbiddenException('Not allowed to update this message');
    }
    if (message.readAt) {
      return message;
    }

    return this.prisma.message.update({
      where: { id: messageId },
      data: { readAt: new Date() },
    });
  }
}
