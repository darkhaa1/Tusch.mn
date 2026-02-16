import { IsEnum } from 'class-validator';
import { ListingStatus } from '@repo/shared';

export class AdminUpdateListingStatusDto {
  @IsEnum(ListingStatus)
  status!: ListingStatus;
}
