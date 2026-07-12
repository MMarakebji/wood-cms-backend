import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, MaxLength, MinLength } from 'class-validator';

function trimRequiredString({ value }: { value: unknown }): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

export class UpdateProductImageDto {
  @ApiProperty({
    example: 'Oak wood boards prepared for furniture production',
    maxLength: 255,
  })
  @Transform(trimRequiredString)
  @IsString()
  @MinLength(2, {
    message: 'Image alternative text must contain at least 2 characters',
  })
  @MaxLength(255, {
    message: 'Image alternative text must not exceed 255 characters',
  })
  altText!: string;
}
