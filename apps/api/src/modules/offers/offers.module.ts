import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma.module';
import { EmailVerifiedGuard } from '../../common/guards/email-verified.guard';
import { NotificationsService } from '../notifications/notifications.service';
import { OffersController } from './offers.controller';
import { OffersService } from './offers.service';
import { OfferOwnershipGuard } from '../../common/guards/ownership.guard';

@Module({
  imports: [PrismaModule],
  controllers: [OffersController],
  providers: [OffersService, EmailVerifiedGuard, NotificationsService, OfferOwnershipGuard],
})
export class OffersModule {}
