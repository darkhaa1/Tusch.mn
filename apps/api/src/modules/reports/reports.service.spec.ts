import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { PrismaService } from '../../database/prisma.service';
import {
  createMockPrismaService,
  MockPrismaService,
} from '../../test-utils/prisma-mock';
import { ReportTargetType, ReportStatus } from '@repo/shared';

const ADMIN = { id: 'admin1', isAdmin: true, status: 'ACTIVE' };

describe('ReportsService', () => {
  let service: ReportsService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    prisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
    jest.clearAllMocks();
  });

  // ─── create ─────────────────────────────────────────────────────────

  describe('create', () => {
    const dto = {
      targetType: ReportTargetType.LISTING,
      targetId: 'l1',
      reason: 'SPAM' as any,
      description: 'Test',
    };

    it('should create a report for a listing', async () => {
      prisma.listing.findFirst.mockResolvedValue({ id: 'l1', userId: 'owner' });
      prisma.report.findFirst.mockResolvedValue(null);
      prisma.report.create.mockResolvedValue({ id: 'r1', ...dto });

      const result = await service.create(dto, 'u1');

      expect(result.id).toBe('r1');
      expect(prisma.report.create).toHaveBeenCalledTimes(1);
    });

    it('should throw BadRequestException when reporting own listing', async () => {
      prisma.listing.findFirst.mockResolvedValue({ id: 'l1', userId: 'u1' });

      await expect(service.create(dto, 'u1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException when listing not found', async () => {
      prisma.listing.findFirst.mockResolvedValue(null);

      await expect(service.create(dto, 'u1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException when active report exists', async () => {
      prisma.listing.findFirst.mockResolvedValue({ id: 'l1', userId: 'owner' });
      prisma.report.findFirst.mockResolvedValue({ id: 'existing' });

      await expect(service.create(dto, 'u1')).rejects.toThrow(
        ConflictException,
      );
    });
  });

  // ─── findAllAdmin ────────────────────────────────────────────────────

  describe('findAllAdmin', () => {
    it('should return paginated reports for admin', async () => {
      prisma.user.findFirst.mockResolvedValue(ADMIN);
      const reports = [{ id: 'r1', targetType: 'LISTING', targetId: 'l1' }];
      prisma.$transaction.mockResolvedValue([reports, 1]);
      prisma.listing.findMany.mockResolvedValue([]);
      prisma.user.findMany.mockResolvedValue([]);

      const result = await service.findAllAdmin('admin1', {
        page: 1,
        limit: 20,
      } as any);

      expect(result.total).toBe(1);
    });

    it('should throw ForbiddenException for non-admin', async () => {
      prisma.user.findFirst.mockResolvedValue({
        id: 'u1',
        isAdmin: false,
        status: 'ACTIVE',
      });

      await expect(
        service.findAllAdmin('u1', { page: 1, limit: 20 } as any),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ─── updateStatus ────────────────────────────────────────────────────

  describe('updateStatus', () => {
    it('should update report status', async () => {
      prisma.user.findFirst.mockResolvedValue(ADMIN);
      prisma.report.findUnique.mockResolvedValue({ id: 'r1' });
      prisma.report.update.mockResolvedValue({
        id: 'r1',
        status: ReportStatus.REVIEWED,
      });

      const result = await service.updateStatus('admin1', 'r1', {
        status: ReportStatus.REVIEWED,
      });

      expect(result.status).toBe(ReportStatus.REVIEWED);
    });

    it('should throw NotFoundException when report not found', async () => {
      prisma.user.findFirst.mockResolvedValue(ADMIN);
      prisma.report.findUnique.mockResolvedValue(null);

      await expect(
        service.updateStatus('admin1', 'r1', {
          status: ReportStatus.REVIEWED,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
