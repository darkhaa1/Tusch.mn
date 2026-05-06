import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Listing } from '@prisma/client';
import { unlink } from 'fs/promises';
import { join, parse as parsePath } from 'path';
import { PrismaService } from '../../database/prisma.service';
import {
  processImage,
  generateThumbnail,
} from '../../common/image/image-processor';
import { LISTING_UPLOAD_DIR } from '../../common/multer/constants';

@Injectable()
export class ListingImageService {
  constructor(private prisma: PrismaService) {}

  private ensureOwnership(listing: Listing, userId: string) {
    if (listing.userId !== userId) {
      throw new ForbiddenException('Not your listing');
    }
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

    const existingImages = await this.prisma.listingImage.findMany({
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
        unlink(rawPath).catch(() => undefined);
      }

      await generateThumbnail(processedPath, thumbPath);

      data.push({
        listingId,
        url: `/uploads/listings/${processedFilename}`,
        thumbnailUrl: `/uploads/listings/${thumbFilename}`,
        position: availablePositions[i],
      });
    }

    await this.prisma.listingImage.createMany({ data });
  }

  async deleteImage(listingId: string, imageId: string, userId: string) {
    const listing = await this.prisma.listing.findFirst({
      where: { id: listingId, deletedAt: null },
    });
    if (!listing) throw new NotFoundException('Listing not found');
    this.ensureOwnership(listing, userId);

    const image = await this.prisma.listingImage.findUnique({
      where: { id: imageId },
    });
    if (!image || image.listingId !== listingId) {
      throw new NotFoundException('Image not found');
    }

    if (image.url) {
      const filePath = join(process.cwd(), image.url.replace(/^\//, ''));
      unlink(filePath).catch(() => undefined);
    }

    if (image.thumbnailUrl) {
      const thumbPath = join(
        process.cwd(),
        image.thumbnailUrl.replace(/^\//, ''),
      );
      unlink(thumbPath).catch(() => undefined);
    }

    await this.prisma.listingImage.delete({ where: { id: imageId } });
  }

  async reorderImages(listingId: string, imageIds: string[], userId: string) {
    const listing = await this.prisma.listing.findFirst({
      where: { id: listingId, deletedAt: null },
    });
    if (!listing) throw new NotFoundException('Listing not found');
    this.ensureOwnership(listing, userId);

    const images = await this.prisma.listingImage.findMany({
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
        await tx.listingImage.update({
          where: { id: imageIds[index] },
          data: { position: index + 1000 },
        });
      }

      for (let index = 0; index < imageIds.length; index++) {
        await tx.listingImage.update({
          where: { id: imageIds[index] },
          data: { position: index },
        });
      }
    });
  }
}
