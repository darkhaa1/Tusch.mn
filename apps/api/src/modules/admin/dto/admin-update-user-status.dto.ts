import { IsEnum } from 'class-validator';
import { UserStatus } from '@prisma/client';

export class AdminUpdateUserStatusDto {
  @IsEnum(UserStatus)
  status!: UserStatus;
}
