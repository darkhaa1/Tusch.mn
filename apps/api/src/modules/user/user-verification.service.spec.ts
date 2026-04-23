import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UserVerificationService } from './user-verification.service';
import { PrismaService } from '../../database/prisma.service';
import {
  createMockPrismaService,
  MockPrismaService,
} from '../../test-utils/prisma-mock';

describe('UserVerificationService', () => {
  let service: UserVerificationService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    prisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserVerificationService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<UserVerificationService>(UserVerificationService);
    jest.clearAllMocks();
  });

  describe('getVerificationStatus', () => {
    it('throws NotFoundException when user not found', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      await expect(service.getVerificationStatus('u1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('returns verification status when user found', async () => {
      prisma.user.findFirst.mockResolvedValue({
        verificationStatus: 'PENDING',
        verificationRejectedReason: null,
        verifiedAt: null,
      });
      const result = await service.getVerificationStatus('u1');
      expect(result.status).toBe('PENDING');
    });
  });

  describe('submitVerification', () => {
    it('updates verification status to PENDING', async () => {
      prisma.user.update.mockResolvedValue({ verificationStatus: 'PENDING' });
      const result = await service.submitVerification('u1', 'doc.jpg');
      expect(result.status).toBe('PENDING');
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'u1' },
          data: expect.objectContaining({ verificationStatus: 'PENDING' }),
        }),
      );
    });
  });
});
