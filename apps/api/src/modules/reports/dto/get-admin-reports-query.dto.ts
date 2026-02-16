import { Type } from 'class-transformer';
import { ReportStatus, ReportTargetType } from '@repo/shared';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';

export class GetAdminReportsQueryDto {
  @IsOptional()
  @IsEnum(ReportStatus)
  status?: ReportStatus;

  @IsOptional()
  @IsEnum(ReportTargetType)
  targetType?: ReportTargetType;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit: number = 20;
}
