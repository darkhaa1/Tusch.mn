import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';

export class ReorderImagesDto {
  @ApiProperty({ description: 'IDs des images dans le nouvel ordre', type: [String] })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  imageIds!: string[];
}
