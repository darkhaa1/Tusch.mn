import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MessagesService } from './messages.service';
import { PrismaService } from '../../database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { EmailService } from '../email/email.service';
import {
  createMockPrismaService,
  MockPrismaService,
} from '../../test-utils/prisma-mock';

const mockNotifications = { create: jest.fn().mockResolvedValue({}) };
const mockEmailService = {
  dispatchToUserId: jest.fn(),
  sendNewMessageEmail: jest.fn().mockResolvedValue(undefined),
};
const mockConfigService = { get: jest.fn().mockReturnValue(undefined) };

describe('MessagesService', () => {
  let service: MessagesService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    prisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagesService,
        { provide: PrismaService, useValue: prisma },
        { provide: NotificationsService, useValue: mockNotifications },
        { provide: EmailService, useValue: mockEmailService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<MessagesService>(MessagesService);
    jest.clearAllMocks();
  });

  // ─── create ─────────────────────────────────────────────────────────

  describe('create', () => {
    const dto = {
      recipientId: 'recipient-1',
      listingId: 'listing-1',
      content: 'Hello!',
    };
    const senderId = 'sender-1';

    it('should throw BadRequestException when sending to self', async () => {
      await expect(
        service.create({ ...dto, recipientId: senderId }, senderId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when recipient not found', async () => {
      prisma.$transaction.mockResolvedValue([
        null,
        { id: 'listing-1' },
        { firstName: 'A', lastName: 'B' },
      ]);

      await expect(service.create(dto, senderId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when listing not found', async () => {
      prisma.$transaction.mockResolvedValue([
        { id: 'recipient-1' },
        null,
        { firstName: 'A', lastName: 'B' },
      ]);

      await expect(service.create(dto, senderId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when sender not found', async () => {
      prisma.$transaction.mockResolvedValue([
        { id: 'recipient-1' },
        { id: 'listing-1' },
        null,
      ]);

      await expect(service.create(dto, senderId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should create message and notification', async () => {
      prisma.$transaction.mockResolvedValue([
        { id: 'recipient-1' },
        { id: 'listing-1' },
        { firstName: 'John', lastName: 'Doe' },
      ]);
      prisma.message.create.mockResolvedValue({
        id: 'msg-1',
        content: dto.content,
        senderId,
        recipientId: dto.recipientId,
      });

      const result = await service.create(dto, senderId);

      expect(result.id).toBe('msg-1');
      expect(prisma.message.create).toHaveBeenCalledTimes(1);
      expect(mockNotifications.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: dto.recipientId,
          type: 'NEW_MESSAGE',
        }),
      );
    });

    it('should use fallback sender name when names are empty', async () => {
      prisma.$transaction.mockResolvedValue([
        { id: 'recipient-1' },
        { id: 'listing-1' },
        { firstName: '', lastName: '' },
      ]);
      prisma.message.create.mockResolvedValue({ id: 'msg-1' });

      await service.create(dto, senderId);

      expect(mockNotifications.create).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.stringContaining('another user'),
        }),
      );
    });
  });

  // ─── getConversation ────────────────────────────────────────────────

  describe('getConversation', () => {
    it('should return paginated conversation with hasMore flag', async () => {
      const items = [{ id: 'm1' }, { id: 'm2' }];
      prisma.$transaction.mockResolvedValue([items, 5]);

      const result = await service.getConversation('u1', 'u2', 1, 2);

      expect(result.items).toEqual(items);
      expect(result.total).toBe(5);
      expect(result.hasMore).toBe(true);
    });

    it('should return hasMore=false when all messages fit', async () => {
      prisma.$transaction.mockResolvedValue([[{ id: 'm1' }], 1]);

      const result = await service.getConversation('u1', 'u2', 1, 10);

      expect(result.hasMore).toBe(false);
    });
  });

  // ─── getThreads ─────────────────────────────────────────────────────

  describe('getThreads', () => {
    it('should return last message per conversation partner', async () => {
      prisma.message.findMany.mockResolvedValue([
        {
          id: 'm1',
          senderId: 'user-1',
          recipientId: 'partner-1',
          createdAt: new Date('2025-01-02'),
        },
        {
          id: 'm2',
          senderId: 'partner-1',
          recipientId: 'user-1',
          createdAt: new Date('2025-01-01'),
        },
        {
          id: 'm3',
          senderId: 'user-1',
          recipientId: 'partner-2',
          createdAt: new Date('2025-01-01'),
        },
      ]);

      const result = await service.getThreads('user-1');

      expect(result).toHaveLength(2);
      // m1 is the latest for partner-1, m3 for partner-2
      expect(result[0].id).toBe('m1');
      expect(result[1].id).toBe('m3');
    });
  });

  // ─── getUnreadCount ─────────────────────────────────────────────────

  describe('getUnreadCount', () => {
    it('should return unread message count', async () => {
      prisma.message.count.mockResolvedValue(3);

      const result = await service.getUnreadCount('user-1');

      expect(result).toBe(3);
      expect(prisma.message.count).toHaveBeenCalledWith({
        where: { recipientId: 'user-1', readAt: null },
      });
    });
  });

  // ─── markAsRead ─────────────────────────────────────────────────────

  describe('markAsRead', () => {
    it('should throw NotFoundException when message not found', async () => {
      prisma.message.findUnique.mockResolvedValue(null);

      await expect(service.markAsRead('m1', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when not recipient', async () => {
      prisma.message.findUnique.mockResolvedValue({
        id: 'm1',
        recipientId: 'other',
      });

      await expect(service.markAsRead('m1', 'user-1')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should return message as-is if already read', async () => {
      const msg = {
        id: 'm1',
        recipientId: 'user-1',
        readAt: new Date(),
      };
      prisma.message.findUnique.mockResolvedValue(msg);

      const result = await service.markAsRead('m1', 'user-1');

      expect(result).toEqual(msg);
      expect(prisma.message.update).not.toHaveBeenCalled();
    });

    it('should mark message as read', async () => {
      prisma.message.findUnique.mockResolvedValue({
        id: 'm1',
        recipientId: 'user-1',
        readAt: null,
      });
      prisma.message.update.mockResolvedValue({
        id: 'm1',
        readAt: new Date(),
      });

      const result = await service.markAsRead('m1', 'user-1');

      expect(result.readAt).toBeTruthy();
    });
  });
});
