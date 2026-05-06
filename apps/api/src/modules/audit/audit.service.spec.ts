import { Test, TestingModule } from '@nestjs/testing';
import { AuditService } from './audit.service';
import { PrismaService } from '../../database/prisma.service';
import {
  createMockPrismaService,
  MockPrismaService,
} from '../../test-utils/prisma-mock';

describe('AuditService', () => {
  let service: AuditService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    prisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
    jest.clearAllMocks();
  });

  // ─── log ────────────────────────────────────────────────────────────

  describe('log', () => {
    it('should create an audit log entry', async () => {
      prisma.adminActionLog.create.mockResolvedValue({ id: 'log1' });

      await service.log({
        actorId: 'admin1',
        action: 'ADMIN_BAN_USER',
        targetType: 'USER',
        targetId: 'u1',
        metadata: { status: 'SUSPENDED' },
      });

      expect(prisma.adminActionLog.create).toHaveBeenCalledWith({
        data: {
          adminId: 'admin1',
          action: 'ADMIN_BAN_USER',
          targetType: 'USER',
          targetId: 'u1',
          meta: { status: 'SUSPENDED' },
        },
      });
    });

    it('should swallow errors silently', async () => {
      prisma.adminActionLog.create.mockRejectedValue(new Error('DB down'));

      await expect(
        service.log({
          actorId: 'admin1',
          action: 'ADMIN_BAN_USER',
          targetType: 'USER',
          targetId: 'u1',
          metadata: { status: 'SUSPENDED' },
        }),
      ).resolves.toBeUndefined();
    });

    it('should use empty object when metadata is not provided', async () => {
      prisma.adminActionLog.create.mockResolvedValue({ id: 'log2' });

      await service.log({
        actorId: 'admin1',
        action: 'ADMIN_RESTORE_USER',
        targetType: 'USER',
        targetId: 'u1',
      });

      expect(prisma.adminActionLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ meta: {} }),
        }),
      );
    });
  });
});
