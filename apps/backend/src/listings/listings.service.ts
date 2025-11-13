import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Listing } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { QueryListingDto } from './dto/query-listing.dto';

@Injectable()
export class ListingsService {
  constructor(private prisma: PrismaService) { }

  async create(dto: CreateListingDto, userId: string) {
    return this.prisma.listing.create({
      data: { ...dto, userId },
    });
  }

  async findAll(q: QueryListingDto) {
    const where: Prisma.ListingWhereInput = {
      AND: [
        q.search
          ? {
            OR: [
              { title: { contains: q.search, mode: 'insensitive' } },
              { description: { contains: q.search, mode: 'insensitive' } },
              { location: { contains: q.search, mode: 'insensitive' } },
            ],
          }
          : {},
        q.userId ? { userId: q.userId } : {},
      ],
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.listing.findMany({
        where,
        skip: q.skip,
        take: q.take,
        orderBy: { [q.orderBy!]: q.order! },
      }),
      this.prisma.listing.count({ where }),
    ]);

    return {
      data,
      pagination: {
        total,
        skip: q.skip ?? 0,
        take: q.take ?? 20,
      },
    };
  }

  async findOne(id: string) {
    const item = await this.prisma.listing.findUnique({ where: { id } });
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
}
