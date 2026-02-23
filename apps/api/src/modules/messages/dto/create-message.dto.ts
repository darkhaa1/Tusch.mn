import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateMessageDto {
  @ApiProperty({
    description: 'Message content',
    example: 'Hello! Are you available this week?',
    maxLength: 5000,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  content!: string;

  @ApiProperty({ description: 'Listing ID', example: 'clxyz123' })
  @IsString()
  @IsNotEmpty()
  listingId!: string;

  @ApiProperty({ description: 'Recipient user ID', example: 'usr_123' })
  @IsString()
  @IsNotEmpty()
  recipientId!: string;
}
