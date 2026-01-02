import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  content!: string;

  @IsString()
  @IsNotEmpty()
  listingId!: string;

  @IsString()
  @IsNotEmpty()
  recipientId!: string;
}
