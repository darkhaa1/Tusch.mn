import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

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

    const [recipient, listing] = await this.prisma.$transaction([
      this.prisma.user.findUnique({
        where: { id: dto.recipientId },
        select: { id: true },
      }),
      this.prisma.listing.findUnique({
        where: { id: dto.listingId },
        select: { id: true },
      }),
    ]);

    if (!recipient) {
      throw new NotFoundException('Recipient not found');
    }
    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    return this.prisma.message.create({
      data: {
        content: dto.content,
        sender: { connect: { id: senderId } },
        recipient: { connect: { id: dto.recipientId } },
        listing: { connect: { id: dto.listingId } },
      },
    });
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
