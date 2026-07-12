import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { Transform, type TransformFnParams } from 'class-transformer';

export class LoginDto {
  @ApiProperty({
    example: 'admin@woodcms.com',
    description: 'Administrator email address',
  })
  @Transform(({ value }: TransformFnParams): string =>
    typeof value === 'string' ? value.trim().toLowerCase() : '',
  )
  @IsEmail({}, { message: 'Enter a valid email address' })
  @MaxLength(255)
  email!: string;

  @ApiProperty({
    example: 'YourStrongPassword123',
    description: 'Administrator password',
    minLength: 8,
  })
  @IsString()
  @MinLength(8, {
    message: 'Password must contain at least 8 characters',
  })
  @MaxLength(128, {
    message: 'Password must not exceed 128 characters',
  })
  password!: string;
}
