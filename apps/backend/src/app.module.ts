import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from './user/user.service';
import { UserController } from './user/user.controller';
import { AuthModule } from './auth/auth.module';

@Module({
  providers: [PrismaService, UserService],
  controllers: [UserController],
  imports:[ AuthModule]
})
export class AppModule {}
