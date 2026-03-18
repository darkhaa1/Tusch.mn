import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateProfileDto {
  @ApiProperty({ example: 'Bataa', required: false })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ example: 'Enkh', required: false })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ example: '99112233', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'user@example.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: 'basic', required: false })
  @IsOptional()
  @IsString()
  accountType?: string;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  removeAvatar?: boolean;
}
