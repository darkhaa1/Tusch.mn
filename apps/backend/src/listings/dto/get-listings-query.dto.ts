import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export enum ListingsSort {
  Newest = 'newest',
  Oldest = 'oldest',
}

export class GetListingsQueryDto {
  @IsOptional() @IsString()
  category?: string;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  page: number = 1;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(50)
  limit: number = 12;

  @IsOptional() @IsEnum(ListingsSort)
  sort: ListingsSort = ListingsSort.Newest;

  @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(1)
  legacy?: number;
}
