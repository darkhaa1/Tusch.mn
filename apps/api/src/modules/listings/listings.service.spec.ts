import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ListingsService } from './listings.service';
import { ListingImageService } from './listing-image.service';
import { ListingSearchService } from './listing-search.service';
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

describe('ListingsService', () => {
  let service: ListingsService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    prisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListingsService,
        ListingImageService,
        ListingSearchService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ListingsService>(ListingsService);
    jest.clearAllMocks();
  });

  // ─── create ─────────────────────────────────────────────────────────

  describe('create', () => {
    it('should create a listing', async () => {
      const dto = {
        description: 'Test listing',
        price: 5000,
        location: 'UB',
        category: 'tutoring',
      };
      prisma.listing.create.mockResolvedValue({ id: 'l1', ...dto, userId: 'u1' });

      const result = await service.create(dto, 'u1');

      expect(result.id).toBe('l1');
      expect(prisma.listing.create).toHaveBeenCalledWith({
        data: { ...dto, userId: 'u1' },
      });
    });
  });

  // ─── findAll ────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('should return paginated listings', async () => {
      const items = [{ id: 'l1', _count: { favoritedBy: 2 } }];
      prisma.$transaction.mockResolvedValue([items, 1]);

      const result = await service.findAll({
        page: 1,
        limit: 10,
      } as any);

      expect(result.items[0]).toEqual(
        expect.objectContaining({
          id: 'l1',
          favoritesCount: 2,
          isFavorited: false,
        }),
      );
      expect(result.total).toBe(1);
    });

    it('should apply search filter', async () => {
      prisma.$transaction.mockResolvedValue([[], 0]);

      await service.findAll({
        page: 1,
        limit: 10,
        search: 'tutoring',
      } as any);

      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    });

    it('should apply price range filters', async () => {
      prisma.$transaction.mockResolvedValue([[], 0]);

      await service.findAll({
        page: 1,
        limit: 10,
        minPrice: 1000,
        maxPrice: 5000,
      } as any);

      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    });

    it('should apply category filter', async () => {
      prisma.$transaction.mockResolvedValue([[], 0]);

      await service.findAll({
        page: 1,
        limit: 10,
        category: 'tutoring',
      } as any);

      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    });

    it('should apply location filter', async () => {
      prisma.$transaction.mockResolvedValue([[], 0]);

      await service.findAll({
        page: 1,
        limit: 10,
        location: 'UB',
      } as any);

      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    });
  });

  // ─── findPublicById ─────────────────────────────────────────────────

  describe('findPublicById', () => {
    it('should return listing when found', async () => {
      prisma.listing.findFirst.mockResolvedValue({
        id: 'l1',
        _count: { favoritedBy: 0 },
      });

      const result = await service.findPublicById('l1');

      expect(result).toEqual(
        expect.objectContaining({ id: 'l1', favoritesCount: 0 }),
      );
    });

    it('should throw NotFoundException when not found', async () => {
      prisma.listing.findFirst.mockResolvedValue(null);

      await expect(service.findPublicById('l1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ─── findOne ────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('should return listing when found', async () => {
      prisma.listing.findFirst.mockResolvedValue({ id: 'l1' });

      const result = await service.findOne('l1');

      expect(result.id).toBe('l1');
    });

    it('should throw NotFoundException when not found', async () => {
      prisma.listing.findFirst.mockResolvedValue(null);

      await expect(service.findOne('l1')).rejects.toThrow(NotFoundException);
    });
  });

  // ─── update ─────────────────────────────────────────────────────────

  describe('update', () => {
    it('should update listing when owner', async () => {
      prisma.listing.findFirst.mockResolvedValue({
        id: 'l1',
        userId: 'u1',
      });
      prisma.listing.update.mockResolvedValue({
        id: 'l1',
        description: 'Updated',
      });

      const result = await service.update(
        'l1',
        { description: 'Updated' } as any,
        'u1',
      );

      expect(result.description).toBe('Updated');
    });

    it('should throw ForbiddenException when not owner', async () => {
      prisma.listing.findFirst.mockResolvedValue({
        id: 'l1',
        userId: 'other',
      });

      await expect(
        service.update('l1', { description: 'X' } as any, 'u1'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ─── remove ─────────────────────────────────────────────────────────

  describe('remove', () => {
    it('should soft-delete listing when owner', async () => {
      prisma.listing.findFirst.mockResolvedValue({
        id: 'l1',
        userId: 'u1',
      });
      prisma.listing.update.mockResolvedValue({});

      const result = await service.remove('l1', 'u1');

      expect(result.ok).toBe(true);
      expect(prisma.listing.update).toHaveBeenCalledWith({
        where: { id: 'l1' },
        data: { deletedAt: expect.any(Date) },
      });
    });

    it('should throw ForbiddenException when not owner', async () => {
      prisma.listing.findFirst.mockResolvedValue({
        id: 'l1',
        userId: 'other',
      });

      await expect(service.remove('l1', 'u1')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  // ─── addImages ──────────────────────────────────────────────────────

  describe('addImages', () => {
    it('should throw NotFoundException when listing not found', async () => {
      prisma.listing.findFirst.mockResolvedValue(null);

      await expect(service.addImages('l1', [], 'u1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when not owner', async () => {
      prisma.listing.findFirst.mockResolvedValue({
        id: 'l1',
        userId: 'other',
      });

      await expect(service.addImages('l1', [], 'u1')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw BadRequestException when exceeding 3 images', async () => {
      prisma.listing.findFirst.mockResolvedValue({
        id: 'l1',
        userId: 'u1',
      });
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

    it('should add images and return listing', async () => {
      prisma.listing.findFirst.mockResolvedValue({
        id: 'l1',
        userId: 'u1',
      });
      prisma.listingImage.findMany.mockResolvedValue([]);
      prisma.listingImage.createMany.mockResolvedValue({ count: 1 });
      // findOne called at the end returns listing with images
      prisma.listing.findFirst.mockResolvedValueOnce({ id: 'l1', userId: 'u1' });
      prisma.listing.findFirst.mockResolvedValue({
        id: 'l1',
        images: [{ id: 'img1' }],
      });

      const files = [
        { path: '/tmp/test.png', filename: 'test.png' },
      ] as Express.Multer.File[];

      const result = await service.addImages('l1', files, 'u1');

      expect(result).toBeDefined();
    });
  });

  // ─── deleteImage ────────────────────────────────────────────────────

  describe('deleteImage', () => {
    it('should throw NotFoundException when listing not found', async () => {
      prisma.listing.findFirst.mockResolvedValue(null);

      await expect(
        service.deleteImage('l1', 'img1', 'u1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when not owner', async () => {
      prisma.listing.findFirst.mockResolvedValue({
        id: 'l1',
        userId: 'other',
      });

      await expect(
        service.deleteImage('l1', 'img1', 'u1'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when image not found', async () => {
      prisma.listing.findFirst.mockResolvedValue({
        id: 'l1',
        userId: 'u1',
      });
      prisma.listingImage.findUnique.mockResolvedValue(null);

      await expect(
        service.deleteImage('l1', 'img1', 'u1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should delete image and return listing', async () => {
      prisma.listing.findFirst.mockResolvedValue({
        id: 'l1',
        userId: 'u1',
      });
      prisma.listingImage.findUnique.mockResolvedValue({
        id: 'img1',
        listingId: 'l1',
        url: '/uploads/listings/test.jpg',
        thumbnailUrl: '/uploads/listings/test_thumb.jpg',
      });
      prisma.listingImage.delete.mockResolvedValue({});
      // findOne at the end
      prisma.listing.findFirst.mockResolvedValueOnce({ id: 'l1', userId: 'u1' });
      prisma.listing.findFirst.mockResolvedValue({ id: 'l1', images: [] });

      const result = await service.deleteImage('l1', 'img1', 'u1');

      expect(result).toBeDefined();
      expect(prisma.listingImage.delete).toHaveBeenCalled();
    });
  });

  // ─── reorderImages ──────────────────────────────────────────────────

  describe('reorderImages', () => {
    it('should throw NotFoundException when listing not found', async () => {
      prisma.listing.findFirst.mockResolvedValue(null);

      await expect(
        service.reorderImages('l1', ['i1'], 'u1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException on length mismatch', async () => {
      prisma.listing.findFirst.mockResolvedValue({
        id: 'l1',
        userId: 'u1',
      });
      prisma.listingImage.findMany.mockResolvedValue([
        { id: 'i1' },
        { id: 'i2' },
      ]);

      await expect(
        service.reorderImages('l1', ['i1'], 'u1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException on duplicate IDs', async () => {
      prisma.listing.findFirst.mockResolvedValue({
        id: 'l1',
        userId: 'u1',
      });
      prisma.listingImage.findMany.mockResolvedValue([
        { id: 'i1' },
        { id: 'i2' },
      ]);

      await expect(
        service.reorderImages('l1', ['i1', 'i1'], 'u1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException on foreign IDs', async () => {
      prisma.listing.findFirst.mockResolvedValue({
        id: 'l1',
        userId: 'u1',
      });
      prisma.listingImage.findMany.mockResolvedValue([
        { id: 'i1' },
        { id: 'i2' },
      ]);

      await expect(
        service.reorderImages('l1', ['i1', 'foreign'], 'u1'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ─── getListingsByUser ──────────────────────────────────────────────

  describe('getListingsByUser', () => {
    it('should return user listings', async () => {
      prisma.listing.findMany.mockResolvedValue([{ id: 'l1' }]);

      const result = await service.getListingsByUser('u1');

      expect(result).toHaveLength(1);
      expect(prisma.listing.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'u1', deletedAt: null },
        }),
      );
    });
  });

  // ─── getDistinctLocations ───────────────────────────────────────────

  describe('getDistinctLocations', () => {
    it('should return distinct locations', async () => {
      prisma.listing.findMany.mockResolvedValue([
        { location: 'UB' },
        { location: 'Darkhan' },
      ]);

      const result = await service.getDistinctLocations();

      expect(result).toEqual(['UB', 'Darkhan']);
    });
  });
});
