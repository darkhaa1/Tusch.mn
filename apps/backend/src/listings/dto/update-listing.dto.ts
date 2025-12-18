import { PartialType } from '@nestjs/mapped-types';
import { IsInt, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator';
import { CreateListingDto } from './create-listing.dto';

export class UpdateListingDto extends PartialType(CreateListingDto) {
  @IsOptional() @IsString() @MinLength(3) @MaxLength(120)
  title?: string;

  @IsOptional() @IsString() @MinLength(10) @MaxLength(5000)
  description?: string;

  @IsOptional() @IsInt() @Min(0)
  price?: number;

  @IsOptional() @IsString() @MaxLength(255)
  location?: string;

  @IsOptional() @IsString() @MaxLength(100)
  category?: string;
}
