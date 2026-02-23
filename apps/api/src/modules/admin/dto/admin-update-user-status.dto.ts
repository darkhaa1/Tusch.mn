import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { UserStatus } from '@repo/shared';

export class AdminUpdateUserStatusDto {
  @ApiProperty({ enum: UserStatus, example: UserStatus.ACTIVE })
  @IsEnum(UserStatus)
  status!: UserStatus;
}
