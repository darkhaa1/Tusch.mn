import { ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { CATEGORY_SLUGS } from '@repo/shared';
import { CreateListingDto } from './create-listing.dto';

export class UpdateListingDto extends PartialType(CreateListingDto) {
  @ApiPropertyOptional({ example: 'Description mise à jour', minLength: 10, maxLength: 5000 })
  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  description?: string;

  @ApiPropertyOptional({ example: 60000, minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ example: 'Darkhan' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string;

  @ApiPropertyOptional({ example: 'tutoring' })
  @IsOptional()
  @IsIn(CATEGORY_SLUGS, { message: 'Буруу ангилал' })
  category?: string;
}
