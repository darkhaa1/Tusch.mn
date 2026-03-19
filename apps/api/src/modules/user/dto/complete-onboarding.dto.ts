import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@repo/shared';

export class CompleteOnboardingDto {
  @ApiPropertyOptional({ enum: UserRole, example: 'CLIENT' })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({ example: 'Улаанбаатар' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({ example: 'Би мэргэжлийн сантехникч...' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @ApiPropertyOptional({ type: [String], example: ['network_repair'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  serviceCategories?: string[];

  @ApiPropertyOptional({ type: [String], example: ['Улаанбаатар', 'Дархан'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  serviceZones?: string[];
}
