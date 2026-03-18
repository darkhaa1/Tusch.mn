import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { UserRole } from '@repo/shared';

export class UpdateMyRoleDto {
  @ApiProperty({ enum: ['CLIENT', 'PROVIDER', 'BOTH'], example: 'PROVIDER' })
  @IsEnum(UserRole)
  role!: UserRole;
}
