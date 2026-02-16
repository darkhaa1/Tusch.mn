import { IsEnum } from 'class-validator';
import { UserStatus } from '@repo/shared';

export class AdminUpdateUserStatusDto {
  @IsEnum(UserStatus)
  status!: UserStatus;
}
