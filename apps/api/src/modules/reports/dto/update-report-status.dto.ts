import { ReportStatus } from '@prisma/client';
import { IsEnum, IsIn } from 'class-validator';

export class UpdateReportStatusDto {
  @IsEnum(ReportStatus)
  @IsIn([ReportStatus.REVIEWED, ReportStatus.DISMISSED])
  status!: Extract<ReportStatus, 'REVIEWED' | 'DISMISSED'>;
}
