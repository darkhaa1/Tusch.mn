import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UserServiceZonesService } from './user-service-zones.service';
import { PrismaService } from '../../database/prisma.service';
import {
  createMockPrismaService,
  MockPrismaService,
} from '../../test-utils/prisma-mock';

describe('UserServiceZonesService', () => {
  let service: UserServiceZonesService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    prisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserServiceZonesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<UserServiceZonesService>(UserServiceZonesService);
    jest.clearAllMocks();
  });

  describe('updateServiceZones', () => {
    it('throws BadRequestException for invalid city', async () => {
      await expect(
        service.updateServiceZones('u1', [{ city: 'INVALID_CITY_XYZ' }]),
      ).rejects.toThrow(BadRequestException);
    });

    it('replaces zones for valid input', async () => {
      prisma.$transaction.mockResolvedValue([]);
      prisma.serviceZone.findMany.mockResolvedValue([]);

      const result = await service.updateServiceZones('u1', [
        { city: 'Улаанбаатар' },
      ]);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getServiceZones', () => {
    it('throws NotFoundException when user not found', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      await expect(service.getServiceZones('u1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('returns zones when user found', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: 'u1' });
      prisma.serviceZone.findMany.mockResolvedValue([
        { id: 'z1', city: 'Улаанбаатар', district: null },
      ]);
      const result = await service.getServiceZones('u1');
      expect(result).toHaveLength(1);
    });
  });
});
