import { ReportStatus } from '@repo/shared';
import { IsEnum, IsIn } from 'class-validator';

export class UpdateReportStatusDto {
  @IsEnum(ReportStatus)
  @IsIn([ReportStatus.REVIEWED, ReportStatus.DISMISSED])
  status!: Extract<ReportStatus, 'REVIEWED' | 'DISMISSED'>;
}
