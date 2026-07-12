import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

function trimString({ value }: { value: unknown }): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

export class CreateContactMessageDto {
  @ApiProperty({
    example: 'Mohammad Elmarakebji',
    maxLength: 150,
  })
  @Transform(trimString)
  @IsString()
  @MinLength(2, {
    message: 'Name must contain at least 2 characters',
  })
  @MaxLength(150, {
    message: 'Name must not exceed 150 characters',
  })
  name!: string;

  @ApiProperty({
    example: '+961 70 123 456',
    maxLength: 40,
  })
  @Transform(trimString)
  @IsString()
  @MinLength(6, {
    message: 'Phone number must contain at least 6 characters',
  })
  @MaxLength(40, {
    message: 'Phone number must not exceed 40 characters',
  })
  @Matches(/^[0-9+\-()\s]+$/, {
    message: 'Phone number contains unsupported characters',
  })
  phone!: string;

  @ApiProperty({
    example: 'I would like more information about your oak wood products.',
    maxLength: 3000,
  })
  @Transform(trimString)
  @IsString()
  @MinLength(10, {
    message: 'Question must contain at least 10 characters',
  })
  @MaxLength(3000, {
    message: 'Question must not exceed 3000 characters',
  })
  message!: string;
}
