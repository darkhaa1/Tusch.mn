import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../../database/prisma.service';
import {
  createMockPrismaService,
  MockPrismaService,
} from '../../test-utils/prisma-mock';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    prisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    jest.clearAllMocks();
  });

  // ─── findAll ────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('should return paginated notifications with unread count', async () => {
      const items = [{ id: 'n1' }, { id: 'n2' }];
      prisma.$transaction.mockResolvedValue([items, 2, 1]);

      const result = await service.findAll('user-1', 1, 10);

      expect(result.items).toEqual(items);
      expect(result.total).toBe(2);
      expect(result.unreadCount).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should clamp page to minimum 1', async () => {
      prisma.$transaction.mockResolvedValue([[], 0, 0]);

      const result = await service.findAll('user-1', -5, 10);

      expect(result.page).toBe(1);
    });

    it('should clamp limit to max 50', async () => {
      prisma.$transaction.mockResolvedValue([[], 0, 0]);

      const result = await service.findAll('user-1', 1, 100);

      expect(result.limit).toBe(50);
    });
  });

  // ─── getUnreadCount ─────────────────────────────────────────────────

  describe('getUnreadCount', () => {
    it('should return unread count', async () => {
      prisma.notification.count.mockResolvedValue(5);

      const result = await service.getUnreadCount('user-1');

      expect(result).toEqual({ count: 5 });
      expect(prisma.notification.count).toHaveBeenCalledWith({
        where: { userId: 'user-1', readAt: null },
      });
    });
  });

  // ─── markAsRead ─────────────────────────────────────────────────────

  describe('markAsRead', () => {
    it('should throw NotFoundException when notification not found', async () => {
      prisma.notification.findUnique.mockResolvedValue(null);

      await expect(service.markAsRead('n1', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when not owner', async () => {
      prisma.notification.findUnique.mockResolvedValue({
        id: 'n1',
        userId: 'other-user',
      });

      await expect(service.markAsRead('n1', 'user-1')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should mark notification as read', async () => {
      prisma.notification.findUnique.mockResolvedValue({
        id: 'n1',
        userId: 'user-1',
        readAt: null,
      });
      prisma.notification.update.mockResolvedValue({
        id: 'n1',
        readAt: new Date(),
      });

      const result = await service.markAsRead('n1', 'user-1');

      expect(result.readAt).toBeTruthy();
    });
  });

  // ─── markAllAsRead ──────────────────────────────────────────────────

  describe('markAllAsRead', () => {
    it('should update all unread notifications for user', async () => {
      prisma.notification.updateMany.mockResolvedValue({ count: 3 });

      const result = await service.markAllAsRead('user-1');

      expect(result.success).toBe(true);
      expect(prisma.notification.updateMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', readAt: null },
        data: { readAt: expect.any(Date) },
      });
    });
  });

  // ─── create ─────────────────────────────────────────────────────────

  describe('create', () => {
    it('should create a notification', async () => {
      const data = {
        userId: 'user-1',
        type: 'NEW_MESSAGE' as any,
        title: 'Test',
        body: 'Test body',
      };
      prisma.notification.create.mockResolvedValue({ id: 'n1', ...data });

      const result = await service.create(data);

      expect(result.id).toBe('n1');
      expect(prisma.notification.create).toHaveBeenCalledWith({ data });
    });
  });
});
