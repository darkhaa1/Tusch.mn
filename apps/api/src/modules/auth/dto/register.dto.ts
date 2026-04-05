import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsNotEmpty, Equals, MinLength } from 'class-validator';

export class AuthDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @MinLength(6)
  password!: string;

  @ApiProperty({ example: 'John' })
  @IsNotEmpty()
  firstName!: string;

  @ApiProperty({ example: 'Doe' })
  @IsNotEmpty()
  lastName!: string;

  @ApiProperty({ example: '99112233' })
  @IsNotEmpty()
  phone!: string;

  @ApiProperty({ example: 'basic' })
  @IsNotEmpty()
  accountType!: string;

  @ApiProperty({ example: true, description: 'Үйлчилгээний нөхцөл болон нууцлалын бодлогыг зөвшөөрсөн эсэх' })
  @IsBoolean()
  @Equals(true, { message: 'Бүртгүүлэхийн тулд үйлчилгээний нөхцөлийг зөвшөөрөх шаардлагатай' })
  acceptedTerms!: boolean;
}
