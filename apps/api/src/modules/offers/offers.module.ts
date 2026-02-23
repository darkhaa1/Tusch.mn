import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma.module';
import { EmailVerifiedGuard } from '../../common/guards/email-verified.guard';
import { NotificationsService } from '../notifications/notifications.service';
import { OffersController } from './offers.controller';
import { OffersService } from './offers.service';

@Module({
  imports: [PrismaModule],
  controllers: [OffersController],
  providers: [OffersService, EmailVerifiedGuard, NotificationsService],
})
export class OffersModule {}
