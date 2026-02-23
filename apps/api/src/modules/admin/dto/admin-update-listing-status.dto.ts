import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { ListingStatus } from '@repo/shared';

export class AdminUpdateListingStatusDto {
  @ApiProperty({ enum: ListingStatus, example: ListingStatus.ACTIVE })
  @IsEnum(ListingStatus)
  status!: ListingStatus;
}
