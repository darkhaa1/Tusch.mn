import { ApiProperty } from '@nestjs/swagger';
import { ReportStatus } from '@repo/shared';
import { IsEnum, IsIn } from 'class-validator';

export class UpdateReportStatusDto {
  @ApiProperty({
    enum: [ReportStatus.REVIEWED, ReportStatus.DISMISSED],
    example: ReportStatus.REVIEWED,
  })
  @IsEnum(ReportStatus)
  @IsIn([ReportStatus.REVIEWED, ReportStatus.DISMISSED])
  status!: Extract<ReportStatus, 'REVIEWED' | 'DISMISSED'>;
}
