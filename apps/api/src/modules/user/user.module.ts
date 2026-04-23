import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserVerificationService } from './user-verification.service';
import { UserServiceZonesService } from './user-service-zones.service';
import { UserController } from './user.controller';
import { PrismaModule } from '../../database/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [UserController],
  providers: [
    UserService,
    UserVerificationService,
    UserServiceZonesService,
    OptionalJwtAuthGuard,
  ],
  exports: [UserService],
})
export class UserModule {}
