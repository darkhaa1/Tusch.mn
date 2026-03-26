import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class ServiceZoneItemDto {
  @ApiProperty({ example: 'Улаанбаатар' })
  @IsString()
  city!: string;

  @ApiPropertyOptional({ example: 'Баянгол' })
  @IsOptional()
  @IsString()
  district?: string;
}

export class UpdateServiceZonesDto {
  @ApiProperty({ type: [ServiceZoneItemDto], maxItems: 20 })
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMaxSize(20, { message: 'Maximum 20 service zones allowed' })
  @Type(() => ServiceZoneItemDto)
  zones!: ServiceZoneItemDto[];
}
