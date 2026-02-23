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
  @ApiProperty({ example: 50000, minimum: 0, description: 'Prix proposé en MNT' })
  @IsInt()
  @Min(0)
  price!: number;

  @ApiProperty({ example: 'Je peux réaliser ce travail en 2 jours', maxLength: 1000 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  message!: string;

  @ApiPropertyOptional({ example: 3, minimum: 1, description: 'Durée estimée en jours' })
  @IsOptional()
  @IsInt()
  @Min(1)
  estimatedDays?: number;
}
