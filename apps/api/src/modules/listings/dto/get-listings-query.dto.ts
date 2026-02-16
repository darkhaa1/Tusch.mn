import { Type } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { ListingsSort, CATEGORY_SLUGS } from '@repo/shared';

@ValidatorConstraint({ name: 'maxPriceGteMinPrice', async: false })
class MaxPriceGteMinPrice implements ValidatorConstraintInterface {
  validate(_value: unknown, args: ValidationArguments) {
    const obj = args.object as GetListingsQueryDto;
    if (obj.minPrice === undefined || obj.maxPrice === undefined) return true;
    return obj.maxPrice >= obj.minPrice;
  }

  defaultMessage() {
    return 'maxPrice must be greater than or equal to minPrice';
  }
}

export class GetListingsQueryDto {
  @IsOptional()
  @IsIn(CATEGORY_SLUGS, { message: 'Буруу ангилал' })
  category?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Validate(MaxPriceGteMinPrice)
  maxPrice?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  location?: string;

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
  limit: number = 12;

  @IsOptional()
  @IsEnum(ListingsSort)
  sort: ListingsSort = ListingsSort.Newest;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(1)
  legacy?: number;
}
