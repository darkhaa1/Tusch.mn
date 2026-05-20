import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OffersService } from './offers.service';
import { PrismaService } from '../../database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { EmailService } from '../email/email.service';
import {
  createMockPrismaService,
  MockPrismaService,
} from '../../test-utils/prisma-mock';

const mockNotifications = { create: jest.fn().mockResolvedValue({}) };
const mockEmailService = {
  isEnabled: jest.fn().mockReturnValue(false),
  dispatchToUserId: jest.fn(),
  sendNewOfferEmail: jest.fn().mockResolvedValue(undefined),
  sendOfferAcceptedEmail: jest.fn().mockResolvedValue(undefined),
  sendOfferRejectedEmail: jest.fn().mockResolvedValue(undefined),
  sendOfferCompletedEmail: jest.fn().mockResolvedValue(undefined),
};
const mockConfigService = { get: jest.fn().mockReturnValue(undefined) };

describe('OffersService', () => {
  let service: OffersService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    prisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OffersService,
        { provide: PrismaService, useValue: prisma },
        { provide: NotificationsService, useValue: mockNotifications },
        { provide: EmailService, useValue: mockEmailService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<OffersService>(OffersService);
    jest.clearAllMocks();
  });

  // ─── create ─────────────────────────────────────────────────────────

  describe('create', () => {
    const dto = { price: 3000, message: 'I can do this' };
    const listingId = 'listing-1';
    const userId = 'provider-1';

    it('should create an offer for a provider', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: userId,
        role: 'PROVIDER',
        firstName: 'John',
        lastName: 'Doe',
      });
      prisma.listing.findFirst.mockResolvedValue({
        id: listingId,
        userId: 'client-1',
        deletedAt: null,
      });
      prisma.offer.findFirst.mockResolvedValue(null);
      prisma.offer.create.mockResolvedValue({
        id: 'offer-1',
        listingId,
        providerId: userId,
        price: dto.price,
        status: 'PENDING',
      });

      const result = await service.create(listingId, dto, userId);

      expect(result.id).toBe('offer-1');
      expect(prisma.offer.create).toHaveBeenCalledTimes(1);
      expect(mockNotifications.create).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'NEW_OFFER' }),
      );
    });

    it('should allow BOTH role to create offers', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: userId,
        role: 'BOTH',
        firstName: 'A',
        lastName: 'B',
      });
      prisma.listing.findFirst.mockResolvedValue({
        id: listingId,
        userId: 'client-1',
      });
      prisma.offer.findFirst.mockResolvedValue(null);
      prisma.offer.create.mockResolvedValue({ id: 'offer-1' });

      await expect(
        service.create(listingId, dto, userId),
      ).resolves.toBeDefined();
    });

    it('should throw ForbiddenException for CLIENT role', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: userId,
        role: 'CLIENT',
      });

      await expect(service.create(listingId, dto, userId)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw NotFoundException when listing not found', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: userId,
        role: 'PROVIDER',
        firstName: 'A',
        lastName: 'B',
      });
      prisma.listing.findFirst.mockResolvedValue(null);

      await expect(service.create(listingId, dto, userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException on own listing', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: userId,
        role: 'PROVIDER',
        firstName: 'A',
        lastName: 'B',
      });
      prisma.listing.findFirst.mockResolvedValue({
        id: listingId,
        userId, // same as provider
      });

      await expect(service.create(listingId, dto, userId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw ConflictException on duplicate pending offer', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: userId,
        role: 'PROVIDER',
        firstName: 'A',
        lastName: 'B',
      });
      prisma.listing.findFirst.mockResolvedValue({
        id: listingId,
        userId: 'client-1',
      });
      prisma.offer.findFirst.mockResolvedValue({ id: 'existing-offer' });

      await expect(service.create(listingId, dto, userId)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  // ─── findSent ───────────────────────────────────────────────────────

  describe('findSent', () => {
    it('should return paginated sent offers', async () => {
      const items = [{ id: 'o1' }];
      prisma.$transaction.mockResolvedValue([items, 1]);

      const result = await service.findSent('user-1', 1, 10);

      expect(result.items).toEqual(items);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });
  });

  // ─── findReceived ───────────────────────────────────────────────────

  describe('findReceived', () => {
    it('should return paginated received offers', async () => {
      prisma.$transaction.mockResolvedValue([[{ id: 'o1' }], 1]);

      const result = await service.findReceived('user-1', 1, 10);

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });

  // ─── findByListing ──────────────────────────────────────────────────

  describe('findByListing', () => {
    it('should throw NotFoundException when listing not found', async () => {
      prisma.listing.findFirst.mockResolvedValue(null);

      await expect(
        service.findByListing('listing-1', 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when not listing owner', async () => {
      prisma.listing.findFirst.mockResolvedValue({
        id: 'listing-1',
        userId: 'other-user',
      });

      await expect(
        service.findByListing('listing-1', 'user-1'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should return offers for listing owner', async () => {
      prisma.listing.findFirst.mockResolvedValue({
        id: 'listing-1',
        userId: 'user-1',
      });
      prisma.offer.findMany.mockResolvedValue([{ id: 'o1' }]);

      const result = await service.findByListing('listing-1', 'user-1');

      expect(result).toHaveLength(1);
    });
  });

  // ─── findOne ────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('should throw NotFoundException when offer not found', async () => {
      prisma.offer.findUnique.mockResolvedValue(null);

      await expect(service.findOne('o1', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when not provider or listing owner', async () => {
      prisma.offer.findUnique.mockResolvedValue({
        id: 'o1',
        providerId: 'provider-1',
        listing: { userId: 'client-1' },
      });

      await expect(service.findOne('o1', 'stranger')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should return offer for provider', async () => {
      prisma.offer.findUnique.mockResolvedValue({
        id: 'o1',
        providerId: 'provider-1',
        listing: { userId: 'client-1' },
      });

      const result = await service.findOne('o1', 'provider-1');

      expect(result.id).toBe('o1');
    });

    it('should return offer for listing owner', async () => {
      prisma.offer.findUnique.mockResolvedValue({
        id: 'o1',
        providerId: 'provider-1',
        listing: { userId: 'client-1' },
      });

      const result = await service.findOne('o1', 'client-1');

      expect(result.id).toBe('o1');
    });
  });

  // ─── cancel ─────────────────────────────────────────────────────────

  describe('cancel', () => {
    it('should throw NotFoundException when offer not found', async () => {
      prisma.offer.findUnique.mockResolvedValue(null);

      await expect(service.cancel('o1', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when not provider', async () => {
      prisma.offer.findUnique.mockResolvedValue({
        id: 'o1',
        providerId: 'other',
        status: 'PENDING',
      });

      await expect(service.cancel('o1', 'user-1')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw BadRequestException when not pending', async () => {
      prisma.offer.findUnique.mockResolvedValue({
        id: 'o1',
        providerId: 'user-1',
        status: 'ACCEPTED',
      });

      await expect(service.cancel('o1', 'user-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should cancel a pending offer', async () => {
      prisma.offer.findUnique.mockResolvedValue({
        id: 'o1',
        providerId: 'user-1',
        status: 'PENDING',
      });
      prisma.offer.update.mockResolvedValue({
        id: 'o1',
        status: 'CANCELLED',
      });

      const result = await service.cancel('o1', 'user-1');

      expect(result.status).toBe('CANCELLED');
    });
  });

  // ─── accept ─────────────────────────────────────────────────────────

  describe('accept', () => {
    it('should throw NotFoundException when offer not found', async () => {
      prisma.offer.findUnique.mockResolvedValue(null);

      await expect(service.accept('o1', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when not listing owner', async () => {
      prisma.offer.findUnique.mockResolvedValue({
        id: 'o1',
        listing: { userId: 'other' },
        status: 'PENDING',
      });

      await expect(service.accept('o1', 'user-1')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw BadRequestException when not pending', async () => {
      prisma.offer.findUnique.mockResolvedValue({
        id: 'o1',
        listing: { userId: 'user-1' },
        status: 'ACCEPTED',
      });

      await expect(service.accept('o1', 'user-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should accept offer, reject others, create message and notification', async () => {
      prisma.offer.findUnique.mockResolvedValue({
        id: 'o1',
        listingId: 'listing-1',
        providerId: 'provider-1',
        listing: { id: 'listing-1', userId: 'user-1', description: 'Test' },
        provider: { id: 'provider-1', firstName: 'P', lastName: 'U' },
        status: 'PENDING',
      });

      const updatedOffer = { id: 'o1', status: 'ACCEPTED', respondedAt: new Date() };
      prisma.$transaction.mockResolvedValue([updatedOffer]);

      const result = await service.accept('o1', 'user-1');

      expect(result.status).toBe('ACCEPTED');
      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    });
  });

  // ─── reject ─────────────────────────────────────────────────────────

  describe('reject', () => {
    it('should throw NotFoundException when offer not found', async () => {
      prisma.offer.findUnique.mockResolvedValue(null);

      await expect(service.reject('o1', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when not listing owner', async () => {
      prisma.offer.findUnique.mockResolvedValue({
        id: 'o1',
        listing: { userId: 'other' },
        status: 'PENDING',
      });

      await expect(service.reject('o1', 'user-1')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw BadRequestException when not pending', async () => {
      prisma.offer.findUnique.mockResolvedValue({
        id: 'o1',
        listing: { userId: 'user-1' },
        status: 'REJECTED',
      });

      await expect(service.reject('o1', 'user-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should reject offer and create notification', async () => {
      prisma.offer.findUnique.mockResolvedValue({
        id: 'o1',
        providerId: 'provider-1',
        listing: { userId: 'user-1' },
        status: 'PENDING',
      });
      prisma.offer.update.mockResolvedValue({
        id: 'o1',
        status: 'REJECTED',
        respondedAt: new Date(),
      });

      const result = await service.reject('o1', 'user-1');

      expect(result.status).toBe('REJECTED');
      expect(mockNotifications.create).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'OFFER_REJECTED' }),
      );
    });
  });
});
