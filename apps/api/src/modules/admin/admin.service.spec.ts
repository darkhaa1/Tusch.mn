import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AdminService } from './admin.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../../database/prisma.service';
import {
  createMockPrismaService,
  MockPrismaService,
} from '../../test-utils/prisma-mock';
import { UserStatus } from '@repo/shared';

describe('AdminService', () => {
  let service: AdminService;
  let prisma: MockPrismaService;
  let notificationsService: { create: jest.Mock };

  beforeEach(async () => {
    prisma = createMockPrismaService();
    notificationsService = { create: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: PrismaService, useValue: prisma },
        { provide: NotificationsService, useValue: notificationsService },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    jest.clearAllMocks();
  });

  // ─── getStats ───────────────────────────────────────────────────────

  describe('getStats', () => {
    it('should return all stats', async () => {
      prisma.$transaction.mockResolvedValue([10, 2, 50, 3, 200, 30]);

      const result = await service.getStats();

      expect(result).toEqual({
        usersTotal: 10,
        usersSuspended: 2,
        listingsTotal: 50,
        listingsHidden: 3,
        messagesTotal: 200,
        reviewsTotal: 30,
      });
    });
  });

  // ─── updateUserStatus ────────────────────────────────────────────────

  describe('updateUserStatus', () => {
    it('should update user status', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        status: UserStatus.ACTIVE,
      });
      prisma.$transaction.mockResolvedValue([{ id: 'u1', status: UserStatus.SUSPENDED, isAdmin: false }]);

      const result = await service.updateUserStatus(
        'admin1',
        'u1',
        UserStatus.SUSPENDED,
      );

      expect(result.status).toBe(UserStatus.SUSPENDED);
      expect(notificationsService.create).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.updateUserStatus('admin1', 'u1', UserStatus.SUSPENDED),
      ).rejects.toThrow(NotFoundException);
    });

    it('should not send notification when status is not SUSPENDED', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        status: UserStatus.SUSPENDED,
      });
      prisma.$transaction.mockResolvedValue([{ id: 'u1', status: UserStatus.ACTIVE, isAdmin: false }]);

      await service.updateUserStatus('admin1', 'u1', UserStatus.ACTIVE);

      expect(notificationsService.create).not.toHaveBeenCalled();
    });
  });

  // ─── getUsers ───────────────────────────────────────────────────────

  describe('getUsers', () => {
    it('should return paginated users', async () => {
      const users = [{ id: 'u1', email: 'a@b.com' }];
      prisma.$transaction.mockResolvedValue([users, 1]);

      const result = await service.getUsers({ page: 1, limit: 20 } as any);

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });
});
