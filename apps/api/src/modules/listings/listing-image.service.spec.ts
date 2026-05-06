import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ListingImageService } from './listing-image.service';
import { PrismaService } from '../../database/prisma.service';
import {
  createMockPrismaService,
  MockPrismaService,
} from '../../test-utils/prisma-mock';

jest.mock('../../common/image/image-processor', () => ({
  processImage: jest.fn().mockResolvedValue(undefined),
  generateThumbnail: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('fs/promises', () => ({
  unlink: jest.fn().mockResolvedValue(undefined),
}));

describe('ListingImageService', () => {
  let service: ListingImageService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    prisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListingImageService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ListingImageService>(ListingImageService);
    jest.clearAllMocks();
  });

  describe('addImages', () => {
    it('throws NotFoundException when listing not found', async () => {
      prisma.listing.findFirst.mockResolvedValue(null);
      await expect(service.addImages('l1', [], 'u1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws ForbiddenException when not owner', async () => {
      prisma.listing.findFirst.mockResolvedValue({ id: 'l1', userId: 'other' });
      await expect(service.addImages('l1', [], 'u1')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('throws BadRequestException when exceeding 3 images', async () => {
      prisma.listing.findFirst.mockResolvedValue({ id: 'l1', userId: 'u1' });
      prisma.listingImage.findMany.mockResolvedValue([
        { id: 'i1', position: 1 },
        { id: 'i2', position: 2 },
      ]);
      const files = [
        { path: '/tmp/a.jpg', filename: 'a.jpg' },
        { path: '/tmp/b.jpg', filename: 'b.jpg' },
      ] as Express.Multer.File[];
      await expect(service.addImages('l1', files, 'u1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('deleteImage', () => {
    it('throws NotFoundException when listing not found', async () => {
      prisma.listing.findFirst.mockResolvedValue(null);
      await expect(service.deleteImage('l1', 'img1', 'u1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws ForbiddenException when not owner', async () => {
      prisma.listing.findFirst.mockResolvedValue({ id: 'l1', userId: 'other' });
      await expect(service.deleteImage('l1', 'img1', 'u1')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('throws NotFoundException when image not found', async () => {
      prisma.listing.findFirst.mockResolvedValue({ id: 'l1', userId: 'u1' });
      prisma.listingImage.findUnique.mockResolvedValue(null);
      await expect(service.deleteImage('l1', 'img1', 'u1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('reorderImages', () => {
    it('throws NotFoundException when listing not found', async () => {
      prisma.listing.findFirst.mockResolvedValue(null);
      await expect(service.reorderImages('l1', ['i1'], 'u1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws BadRequestException on length mismatch', async () => {
      prisma.listing.findFirst.mockResolvedValue({ id: 'l1', userId: 'u1' });
      prisma.listingImage.findMany.mockResolvedValue([{ id: 'i1' }, { id: 'i2' }]);
      await expect(service.reorderImages('l1', ['i1'], 'u1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
