import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({ description: 'Offer ID (must be COMPLETED)', example: 'off_123' })
  @IsString()
  @IsNotEmpty()
  offerId!: string;

  @ApiProperty({ description: 'Rating from 1 to 5', minimum: 1, maximum: 5, example: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @ApiProperty({
    description: 'Review comment (min 20 chars)',
    example: 'Great communication and on-time delivery.',
    minLength: 20,
    maxLength: 2000,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(20)
  @MaxLength(2000)
  comment!: string;
}
