import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Listing, Prisma } from '@prisma/client';
import { ListingStatus, ListingsSort } from '@repo/shared';
import { PrismaService } from '../../database/prisma.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { GetListingsQueryDto } from './dto/get-listings-query.dto';
import { unlink } from 'fs/promises';
import { join, parse as parsePath } from 'path';
import {
  processImage,
  generateThumbnail,
} from '../../common/image/image-processor';
import { LISTING_UPLOAD_DIR } from '../../common/multer/constants';

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

const buildListingInclude = (userId?: string, includePrivateUser = false) => ({
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
  constructor(private prisma: PrismaService) {}

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
    const search = q.search?.trim();
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
        include: buildListingInclude(userId) as any,
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
      include: buildListingInclude(userId) as any,
    });
    if (!item) throw new NotFoundException('Listing not found');
    return this.withFavorites(item, userId);
  }

  async findOne(id: string, userId?: string) {
    const item = await this.prisma.listing.findFirst({
      where: { id, deletedAt: null },
      include: buildListingInclude(userId, true) as any,
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
    const listing = await this.prisma.listing.findFirst({
      where: { id: listingId, deletedAt: null },
    });
    if (!listing) throw new NotFoundException('Listing not found');
    this.ensureOwnership(listing, userId);

    const existingImages = await (this.prisma as any).listingImage.findMany({
      where: { listingId },
      orderBy: { position: 'asc' },
    });

    if (existingImages.length + files.length > 3) {
      throw new BadRequestException('Maximum 3 images par annonce');
    }

    const usedPositions = new Set(existingImages.map((img) => img.position));
    const availablePositions = [1, 2, 3].filter(
      (pos) => !usedPositions.has(pos),
    );

    const data: Array<{
      listingId: string;
      url: string;
      thumbnailUrl: string;
      position: number;
    }> = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const rawPath = file.path;
      const parsed = parsePath(file.filename);
      const baseName = parsed.name;

      const processedFilename = `${baseName}.jpg`;
      const processedPath = join(LISTING_UPLOAD_DIR, processedFilename);
      const thumbFilename = `${baseName}_thumb.jpg`;
      const thumbPath = join(LISTING_UPLOAD_DIR, thumbFilename);

      await processImage(rawPath, processedPath);

      if (
        parsed.ext.toLowerCase() !== '.jpg' &&
        parsed.ext.toLowerCase() !== '.jpeg'
      ) {
        try {
          await unlink(rawPath);
        } catch {
          // ignore
        }
      }

      await generateThumbnail(processedPath, thumbPath);

      data.push({
        listingId,
        url: `/uploads/listings/${processedFilename}`,
        thumbnailUrl: `/uploads/listings/${thumbFilename}`,
        position: availablePositions[i],
      });
    }

    await (this.prisma as any).listingImage.createMany({ data });

    return this.findOne(listingId, userId);
  }

  async deleteImage(listingId: string, imageId: string, userId: string) {
    const listing = await this.prisma.listing.findFirst({
      where: { id: listingId, deletedAt: null },
    });
    if (!listing) throw new NotFoundException('Listing not found');
    this.ensureOwnership(listing, userId);

    const image = await (this.prisma as any).listingImage.findUnique({
      where: { id: imageId },
    });
    if (!image || image.listingId !== listingId) {
      throw new NotFoundException('Image not found');
    }

    // Remove physical files if possible
    if (image.url) {
      const filePath = join(process.cwd(), image.url.replace(/^\//, ''));
      try {
        await unlink(filePath);
      } catch {
        // ignore if already deleted
      }
    }

    if (image.thumbnailUrl) {
      const thumbPath = join(
        process.cwd(),
        image.thumbnailUrl.replace(/^\//, ''),
      );
      try {
        await unlink(thumbPath);
      } catch {
        // ignore if already deleted
      }
    }

    await (this.prisma as any).listingImage.delete({ where: { id: imageId } });

    return this.findOne(listingId, userId);
  }

  async reorderImages(listingId: string, imageIds: string[], userId: string) {
    const listing = await this.prisma.listing.findFirst({
      where: { id: listingId, deletedAt: null },
    });
    if (!listing) throw new NotFoundException('Listing not found');
    this.ensureOwnership(listing, userId);

    const images = await (this.prisma as any).listingImage.findMany({
      where: { listingId },
      select: { id: true },
      orderBy: { position: 'asc' },
    });

    if (imageIds.length !== images.length) {
      throw new BadRequestException('Image list length mismatch');
    }

    const uniqueIds = new Set(imageIds);
    if (uniqueIds.size !== imageIds.length) {
      throw new BadRequestException('Duplicate image IDs are not allowed');
    }

    const existingIds = new Set(images.map((image) => image.id));
    for (const imageId of imageIds) {
      if (!existingIds.has(imageId)) {
        throw new BadRequestException(
          'All image IDs must belong to this listing',
        );
      }
    }

    await this.prisma.$transaction(async (tx) => {
      for (let index = 0; index < imageIds.length; index++) {
        await (tx as any).listingImage.update({
          where: { id: imageIds[index] },
          data: { position: index + 1000 },
        });
      }

      for (let index = 0; index < imageIds.length; index++) {
        await (tx as any).listingImage.update({
          where: { id: imageIds[index] },
          data: { position: index },
        });
      }
    });

    return this.findOne(listingId, userId);
  }

  async getListingsByUser(userId: string) {
    const items = await this.prisma.listing.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: buildListingInclude(userId, true) as any,
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
