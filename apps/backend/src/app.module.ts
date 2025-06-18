import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from './user/user.service';
import { UserController } from './user/user.controller';
import { AuthModule } from './auth/auth.module';
import { JwtService } from '@nestjs/jwt';

@Module({
  providers: [PrismaService, UserService, JwtService],
  controllers: [UserController],
  imports:[ AuthModule]
})
export class AppModule {}
