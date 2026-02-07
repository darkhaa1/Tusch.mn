import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from '../../database/prisma.module';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { EmailVerifiedGuard } from '../../common/guards/email-verified.guard';

@Module({
  imports: [PassportModule, PrismaModule],
  controllers: [MessagesController],
  providers: [MessagesService, EmailVerifiedGuard],
})
export class MessagesModule {}
