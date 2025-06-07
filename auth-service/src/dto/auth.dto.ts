import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  Matches,
  IsEnum,
  IsOptional,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    description: 'The email of the user',
    example: 'test@test.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'The username of the user',
    example: 'vuphan',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: 'The password of the user',
    example: 'Test123!',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @Matches(
    /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+={}\[\]:;"'<>,.?/~`])[A-Za-z\d!@#$%^&*()_+={}\[\]:;"'<>,.?/~`]{8,20}$/,
    {
      message:
        'Password must be 8-20 characters long, with at least one uppercase letter, one number, and one special character',
    },
  )
  password: string;

  @ApiProperty({
    description: 'User role',
    example: 'BUYER',
    enum: ['BUYER', 'SELLER'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['BUYER', 'SELLER'])
  role?: 'BUYER' | 'SELLER';
}

export class LoginDto {
  @ApiProperty({
    description: 'The username of the user',
    example: 'vuphan',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: 'The password of the user',
    example: 'Test123!',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class AuthResponseDto {
  access_token: string;
  user: {
    id: string;
    email: string;
    username: string;
    role: 'BUYER' | 'SELLER';
  };
}
