import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { CATEGORY_SLUGS } from '@repo/shared';

export class CreateListingDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(5000)
  description!: string;

  @IsInt()
  @Min(0)
  price!: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string;

  @IsNotEmpty()
  @IsIn(CATEGORY_SLUGS, { message: 'Буруу ангилал' })
  category!: string;
}
