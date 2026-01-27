import { IsEnum } from 'class-validator';
import { UserRole } from '@prisma/client';

export class UpdateMyRoleDto {
  @IsEnum(UserRole)
  role: UserRole;
}
