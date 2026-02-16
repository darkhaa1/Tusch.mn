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
import { join } from 'path';

const listingPublicInclude = {
  user: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      avatarUrl: true,
    },
  },
  images: {
    orderBy: { position: 'asc' as const },
  },
} as const;

const listingPrivateInclude = {
  user: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      avatarUrl: true,
    },
  },
  images: {
    orderBy: { position: 'asc' as const },
  },
} as const;

@Injectable()
export class ListingsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateListingDto, userId: string) {
    return this.prisma.listing.create({
      data: { ...dto, userId },
    });
  }

  async findAll(q: GetListingsQueryDto) {
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
        include: listingPublicInclude as any,
        skip,
        take: q.limit,
        orderBy: { createdAt: orderBy },
      }),
      this.prisma.listing.count({ where }),
    ]);

    return {
      items: data,
      total,
      page: q.page,
      limit: q.limit,
    };
  }

  async findPublicById(id: string) {
    const item = await this.prisma.listing.findFirst({
      where: {
        id,
        status: ListingStatus.ACTIVE,
        deletedAt: null,
        user: { deletedAt: null },
      },
      include: listingPublicInclude as any,
    });
    if (!item) throw new NotFoundException('Listing not found');
    return item;
  }

  async findOne(id: string) {
    const item = await this.prisma.listing.findFirst({
      where: { id, deletedAt: null },
      include: listingPrivateInclude as any,
    });
    if (!item) throw new NotFoundException('Listing not found');
    return item;
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

    const data = files.map((file, index) => ({
      listingId,
      url: `/uploads/listings/${file.filename}`,
      position: availablePositions[index],
    }));

    await (this.prisma as any).listingImage.createMany({ data });

    return this.findOne(listingId);
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

    // Remove physical file if possible
    if (image.url) {
      const filePath = join(process.cwd(), image.url.replace(/^\//, ''));
      try {
        await unlink(filePath);
      } catch {
        // ignore if already deleted
      }
    }

    await (this.prisma as any).listingImage.delete({ where: { id: imageId } });

    return this.findOne(listingId);
  }

  async getListingsByUser(userId: string) {
    return this.prisma.listing.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: listingPrivateInclude as any,
    });
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
