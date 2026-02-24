import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateOfferDto {
  @ApiProperty({ example: 50000, minimum: 0, description: 'Proposed price in MNT' })
  @IsInt()
  @Min(0)
  price!: number;

  @ApiProperty({ example: 'I can complete this work in 2 days', maxLength: 1000 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  message!: string;

  @ApiPropertyOptional({ example: 3, minimum: 1, description: 'Estimated duration in days' })
  @IsOptional()
  @IsInt()
  @Min(1)
  estimatedDays?: number;
}
