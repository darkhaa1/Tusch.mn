import { IsEnum } from 'class-validator';
import { UserRole } from '@repo/shared';

export class UpdateMyRoleDto {
  @IsEnum(UserRole)
  role: UserRole;
}
