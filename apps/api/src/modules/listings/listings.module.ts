import { Module } from '@nestjs/common';
import { ListingsController } from './listings.controller';
import { ListingsService } from './listings.service';
import { PrismaModule } from '../../database/prisma.module';
import { EmailVerifiedGuard } from '../../common/guards/email-verified.guard';

@Module({
  imports: [PrismaModule],
  controllers: [ListingsController],
  providers: [ListingsService, EmailVerifiedGuard],
})
export class ListingsModule {}
