import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class QueryListingDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(0)
  skip?: number = 0;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100)
  take?: number = 20;

  @IsOptional() @IsString()
  search?: string;

  @IsOptional() @IsIn(['createdAt', 'price'])
  orderBy?: 'createdAt' | 'price' = 'createdAt';

  @IsOptional() @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc' = 'desc';

  @IsOptional() @IsString()
  userId?: string;
}
