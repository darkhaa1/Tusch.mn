import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CompleteOfferDto {
  @ApiPropertyOptional({
    description: 'Optional client note after completion',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  clientNote?: string;
}
