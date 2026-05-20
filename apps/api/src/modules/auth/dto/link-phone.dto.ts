import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LinkPhoneDto {
  @ApiProperty({
    description:
      'Firebase ID token returned by `confirmationResult.confirm(code)` on the client.',
  })
  @IsString()
  @IsNotEmpty()
  idToken!: string;

  @ApiProperty({
    description:
      'Phone number the authenticated user wants to attach. Must match the token.',
    example: '+97699112233',
  })
  @IsString()
  @IsNotEmpty()
  phone!: string;
}
