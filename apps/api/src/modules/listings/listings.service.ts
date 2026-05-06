import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Listing, Prisma } from '@prisma/client';
import { ListingStatus, ListingsSort } from '@repo/shared';
import { PrismaService } from '../../database/prisma.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { GetListingsQueryDto } from './dto/get-listings-query.dto';
import { ListingImageService } from './listing-image.service';
import { ListingSearchService } from './listing-search.service';

const listingUserSelectPublic = {
  id: true,
  firstName: true,
  lastName: true,
  avatarUrl: true,
} as const;

const listingUserSelectPrivate = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  avatarUrl: true,
} as const;

const listingImagesInclude = {
  orderBy: { position: 'asc' as const },
} as const;

const buildListingInclude = (
  userId?: string,
  includePrivateUser = false,
): Prisma.ListingInclude => ({
  user: {
    select: includePrivateUser
      ? listingUserSelectPrivate
      : listingUserSelectPublic,
  },
  images: listingImagesInclude,
  _count: {
    select: { favoritedBy: true },
  },
  ...(userId
    ? {
        favoritedBy: {
          where: { userId },
          select: { id: true },
        },
      }
    : {}),
});

@Injectable()
export class ListingsService {
  private readonly logger = new Logger(ListingsService.name);

  constructor(
    private prisma: PrismaService,
    private listingImages: ListingImageService,
    private searchService: ListingSearchService,
  ) {}

  private withFavorites(listing: any, userId?: string) {
    if (!listing) return listing;
    const { _count, favoritedBy, ...rest } = listing;
    const favoritesCount = _count?.favoritedBy ?? 0;
    const isFavorited = userId ? (favoritedBy?.length ?? 0) > 0 : false;
    return { ...rest, favoritesCount, isFavorited };
  }

  private mapListings(items: any[], userId?: string) {
    return items.map((item) => this.withFavorites(item, userId));
  }

  async create(dto: CreateListingDto, userId: string) {
    return this.prisma.listing.create({
      data: { ...dto, userId },
    });
  }

  async findAll(q: GetListingsQueryDto, userId?: string) {
    // Full-text search path: when q param is provided
    if (q.q?.trim()) {
      const sanitizedQ = this.searchService.buildSearchQuery(q.q);
      if (sanitizedQ) {
        try {
          const { items, total } = await this.searchService.fullTextSearch(
            sanitizedQ,
            q,
            buildListingInclude(userId),
            this.mapListings.bind(this),
            userId,
          );
          return { items, total, page: q.page, limit: q.limit };
        } catch (err) {
          // Graceful fallback: tsvector column may not exist yet (e.g. fresh DB without migration)
          this.logger.warn(
            'Full-text search failed, falling back to LIKE search',
            err,
          );
        }
      }
    }

    // LIKE / filter-only search path (fallback or when q is absent)
    const search = q.search?.trim() ?? q.q?.trim();
    const filters: Prisma.ListingWhereInput[] = [
      { status: ListingStatus.ACTIVE },
      { deletedAt: null },
      { user: { deletedAt: null } },
    ];

    if (q.category) {
      filters.push({ category: q.category });
    }

    if (search) {
      filters.push({
        OR: [
          { description: { contains: search, mode: 'insensitive' } },
          { location: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    if (q.minPrice !== undefined) {
      filters.push({ price: { gte: q.minPrice } });
    }

    if (q.maxPrice !== undefined) {
      filters.push({ price: { lte: q.maxPrice } });
    }

    if (q.location) {
      filters.push({
        location: { contains: q.location, mode: 'insensitive' },
      });
    }

    const where: Prisma.ListingWhereInput = { AND: filters };
    const orderBy = q.sort === ListingsSort.Oldest ? 'asc' : 'desc';
    const skip = (q.page - 1) * q.limit;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.listing.findMany({
        where,
        include: buildListingInclude(userId),
        skip,
        take: q.limit,
        orderBy: { createdAt: orderBy },
      }),
      this.prisma.listing.count({ where }),
    ]);

    return {
      items: this.mapListings(data, userId),
      total,
      page: q.page,
      limit: q.limit,
    };
  }

  async findPublicById(id: string, userId?: string) {
    const item = await this.prisma.listing.findFirst({
      where: {
        id,
        status: ListingStatus.ACTIVE,
        deletedAt: null,
        user: { deletedAt: null },
      },
      include: buildListingInclude(userId),
    });
    if (!item) throw new NotFoundException('Listing not found');
    return this.withFavorites(item, userId);
  }

  async findOne(id: string, userId?: string) {
    const item = await this.prisma.listing.findFirst({
      where: { id, deletedAt: null },
      include: buildListingInclude(userId, true),
    });
    if (!item) throw new NotFoundException('Listing not found');
    return this.withFavorites(item, userId);
  }

  private ensureOwnership(listing: Listing, userId: string) {
    if (listing.userId !== userId) {
      throw new ForbiddenException('Not your listing');
    }
  }

  async update(id: string, dto: UpdateListingDto, userId: string) {
    const existing = await this.findOne(id);
    this.ensureOwnership(existing, userId);

    return this.prisma.listing.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, userId: string) {
    const existing = await this.findOne(id);
    this.ensureOwnership(existing, userId);
    await this.prisma.listing.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return { ok: true };
  }

  async addImages(
    listingId: string,
    files: Express.Multer.File[],
    userId: string,
  ) {
    await this.listingImages.addImages(listingId, files, userId);
    return this.findOne(listingId, userId);
  }

  async deleteImage(listingId: string, imageId: string, userId: string) {
    await this.listingImages.deleteImage(listingId, imageId, userId);
    return this.findOne(listingId, userId);
  }

  async reorderImages(listingId: string, imageIds: string[], userId: string) {
    await this.listingImages.reorderImages(listingId, imageIds, userId);
    return this.findOne(listingId, userId);
  }

  async getListingsByUser(userId: string) {
    const items = await this.prisma.listing.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: buildListingInclude(userId, true),
    });
    return this.mapListings(items, userId);
  }

  async getDistinctLocations(): Promise<string[]> {
    const results = await this.prisma.listing.findMany({
      where: {
        status: ListingStatus.ACTIVE,
        deletedAt: null,
        user: { deletedAt: null },
        location: { not: null },
      },
      select: { location: true },
      distinct: ['location'],
      orderBy: { location: 'asc' },
    });

    return results.map((r) => r.location as string);
  }
}
