import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class AdminUpdateVerificationDto {
  @ApiProperty({ enum: ['APPROVE', 'REJECT'] })
  @IsIn(['APPROVE', 'REJECT'])
  action!: 'APPROVE' | 'REJECT';

  @ApiPropertyOptional({ description: 'Rejection reason (required when action=REJECT)' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
