import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReportReason, ReportTargetType } from '@repo/shared';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateReportDto {
  @ApiProperty({ enum: ReportTargetType, example: ReportTargetType.LISTING })
  @IsEnum(ReportTargetType)
  targetType!: ReportTargetType;

  @ApiProperty({ description: 'Target resource ID', example: 'clxyz123' })
  @IsString()
  @IsNotEmpty()
  targetId!: string;

  @ApiProperty({ enum: ReportReason, example: ReportReason.SPAM })
  @IsEnum(ReportReason)
  reason!: ReportReason;

  @ApiPropertyOptional({
    description: 'Additional report details',
    example: 'This listing looks suspicious.',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;
}
