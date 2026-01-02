import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

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

  async getConversation(userId: string, otherUserId?: string) {
    const conversationFilter = otherUserId
      ? [
          { senderId: userId, recipientId: otherUserId },
          { senderId: otherUserId, recipientId: userId },
        ]
      : [{ senderId: userId }, { recipientId: userId }];

    return this.prisma.message.findMany({
      where: { OR: conversationFilter },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getThreads(userId: string) {
    const messages = await this.prisma.message.findMany({
      where: { OR: [{ senderId: userId }, { recipientId: userId }] },
      orderBy: { createdAt: 'desc' },
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
