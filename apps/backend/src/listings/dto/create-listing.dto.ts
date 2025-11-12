import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateListingDto {
  @IsString() @IsNotEmpty()
  title!: string;

  @IsString() @IsNotEmpty()
  description!: string;

  @IsInt() @Min(0)
  price!: number;

  @IsOptional() @IsString()
  location?: string;
}
