import { Module } from '@nestjs/common';
import { ListingsController } from './listings.controller';
import { ListingsService } from './listings.service';
import { ListingImageService } from './listing-image.service';
import { ListingSearchService } from './listing-search.service';
import { PrismaModule } from '../../database/prisma.module';
import { EmailVerifiedGuard } from '../../common/guards/email-verified.guard';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';
import { ListingOwnershipGuard } from '../../common/guards/ownership.guard';

@Module({
  imports: [PrismaModule],
  controllers: [ListingsController],
  providers: [
    ListingsService,
    ListingImageService,
    ListingSearchService,
    EmailVerifiedGuard,
    OptionalJwtAuthGuard,
    ListingOwnershipGuard,
  ],
})
export class ListingsModule {}
