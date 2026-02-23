import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateOfferDto {
  @IsInt()
  @Min(0)
  price!: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  message!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  estimatedDays?: number;
}
