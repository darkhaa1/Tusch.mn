import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class UnlinkPhoneDto {
  @ApiPropertyOptional({
    description:
      'Account password. Required when the user has email+password set up — it ' +
      'protects against a stolen session being used to remove the phone factor.',
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  password?: string;
}
