import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiProperty({ example: 'I offer math tutoring sessions', minLength: 10, maxLength: 5000 })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(5000)
  description!: string;

  @ApiProperty({ example: 50000, minimum: 0, description: 'Price in MNT' })
  @IsInt()
  @Min(0)
  price!: number;

  @ApiPropertyOptional({ example: 'UB', maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string;

  @ApiProperty({ example: 'tutoring', description: 'Category slug' })
  @IsNotEmpty()
  @IsIn(CATEGORY_SLUGS, { message: 'Буруу ангилал' })
  category!: string;
}
