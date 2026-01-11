import { IsEnum } from 'class-validator';
import { ListingStatus } from '@prisma/client';

export class AdminUpdateListingStatusDto {
  @IsEnum(ListingStatus)
  status!: ListingStatus;
}
