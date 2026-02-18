import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';

export class ReorderImagesDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  imageIds!: string[];
}
