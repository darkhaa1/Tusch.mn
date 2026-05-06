import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { PrismaService } from '../../database/prisma.service';
import {
  createMockPrismaService,
  MockPrismaService,
} from '../../test-utils/prisma-mock';

describe('FavoritesService', () => {
  let service: FavoritesService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    prisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FavoritesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<FavoritesService>(FavoritesService);
    jest.clearAllMocks();
  });

  // ─── addListingFavorite ─────────────────────────────────────────────

  describe('addListingFavorite', () => {
    it('should add favorite listing', async () => {
      prisma.listing.findFirst.mockResolvedValue({
        id: 'l1',
        userId: 'owner',
      });
      prisma.favoriteListing.findUnique.mockResolvedValue(null);
      prisma.favoriteListing.create.mockResolvedValue({ id: 'fav1' });

      const result = await service.addListingFavorite('u1', 'l1');

      expect(result).toEqual({ id: 'fav1' });
      expect(prisma.favoriteListing.create).toHaveBeenCalledWith({
        data: { userId: 'u1', listingId: 'l1' },
      });
    });

    it('should throw NotFoundException when listing not found', async () => {
      prisma.listing.findFirst.mockResolvedValue(null);

      await expect(service.addListingFavorite('u1', 'l1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when favoriting own listing', async () => {
      prisma.listing.findFirst.mockResolvedValue({ id: 'l1', userId: 'u1' });

      await expect(service.addListingFavorite('u1', 'l1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw ConflictException when already favorited', async () => {
      prisma.listing.findFirst.mockResolvedValue({
        id: 'l1',
        userId: 'owner',
      });
      prisma.favoriteListing.findUnique.mockResolvedValue({ id: 'existing' });

      await expect(service.addListingFavorite('u1', 'l1')).rejects.toThrow(
        ConflictException,
      );
    });
  });

  // ─── removeListingFavorite ──────────────────────────────────────────

  describe('removeListingFavorite', () => {
    it('should remove existing favorite', async () => {
      prisma.favoriteListing.findUnique.mockResolvedValue({ id: 'fav1' });
      prisma.favoriteListing.delete.mockResolvedValue({});

      const result = await service.removeListingFavorite('u1', 'l1');

      expect(result.ok).toBe(true);
    });

    it('should throw NotFoundException when favorite does not exist', async () => {
      prisma.favoriteListing.findUnique.mockResolvedValue(null);

      await expect(
        service.removeListingFavorite('u1', 'l1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ─── addProviderFavorite ────────────────────────────────────────────

  describe('addProviderFavorite', () => {
    it('should add favorite provider', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: 'p1' });
      prisma.favoriteProvider.findUnique.mockResolvedValue(null);
      prisma.favoriteProvider.create.mockResolvedValue({ id: 'fav2' });

      const result = await service.addProviderFavorite('u1', 'p1');

      expect(result).toEqual({ id: 'fav2' });
    });

    it('should throw BadRequestException when favoriting yourself', async () => {
      await expect(
        service.addProviderFavorite('u1', 'u1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when provider not found', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(
        service.addProviderFavorite('u1', 'p1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when already favorited', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: 'p1' });
      prisma.favoriteProvider.findUnique.mockResolvedValue({ id: 'existing' });

      await expect(
        service.addProviderFavorite('u1', 'p1'),
      ).rejects.toThrow(ConflictException);
    });
  });

  // ─── removeProviderFavorite ─────────────────────────────────────────

  describe('removeProviderFavorite', () => {
    it('should remove provider favorite', async () => {
      prisma.favoriteProvider.findUnique.mockResolvedValue({ id: 'fav2' });
      prisma.favoriteProvider.delete.mockResolvedValue({});

      const result = await service.removeProviderFavorite('u1', 'p1');

      expect(result.ok).toBe(true);
    });

    it('should throw NotFoundException when not found', async () => {
      prisma.favoriteProvider.findUnique.mockResolvedValue(null);

      await expect(
        service.removeProviderFavorite('u1', 'p1'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
