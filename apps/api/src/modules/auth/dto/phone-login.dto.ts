import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class PhoneLoginDto {
  @ApiProperty({
    description:
      'Firebase ID token returned by `confirmationResult.confirm(code)` on the client.',
  })
  @IsString()
  @IsNotEmpty()
  idToken!: string;

  @ApiProperty({
    description:
      'Phone number that the user verified with Firebase. Must match the token. ' +
      'Free-form input is accepted; the API normalizes it to E.164 (+976XXXXXXXX).',
    example: '+97699112233',
  })
  @IsString()
  @IsNotEmpty()
  phone!: string;
}
