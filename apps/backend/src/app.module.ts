import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from './user/user.service';
import { UserController } from './user/user.controller';

@Module({
  providers: [PrismaService, UserService],
  controllers: [UserController],
})
export class AppModule {}
