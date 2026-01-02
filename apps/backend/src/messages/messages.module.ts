import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { PrismaService } from '../../prisma/prisma.service';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';


@Module({
  imports: [PassportModule],
  controllers: [MessagesController],
  providers: [MessagesService, PrismaService],
})
export class MessagesModule { }
