import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Listing } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import {
  GetListingsQueryDto,
  ListingsSort,
} from './dto/get-listings-query.dto';
import { unlink } from 'fs/promises';
import { join } from 'path';

const listingInclude = {
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
    const where: Prisma.ListingWhereInput = {
      ...(q.category ? { category: q.category } : {}),
    };
    const orderBy = q.sort === ListingsSort.Oldest ? 'asc' : 'desc';
    const skip = (q.page - 1) * q.limit;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.listing.findMany({
        where,
        include: listingInclude as any,
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

  async findOne(id: string) {
    const item = await this.prisma.listing.findUnique({
      where: { id },
      include: listingInclude as any,
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
    await this.prisma.listing.delete({ where: { id } });
    return { ok: true };
  }

  async addImages(
    listingId: string,
    files: Express.Multer.File[],
    userId: string,
  ) {
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
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
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
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
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: listingInclude as any,
    });
  }
}
