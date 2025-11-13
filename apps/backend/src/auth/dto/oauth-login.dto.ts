import { IsEmail, IsOptional, IsString } from 'class-validator';

export class OAuthLoginDto {
  @IsEmail()
  email!: string;

  @IsOptional() @IsString()
  firstName?: string;

  @IsOptional() @IsString()
  lastName?: string;

  @IsOptional() @IsString()
  provider?: string; // "google" etc.
}
