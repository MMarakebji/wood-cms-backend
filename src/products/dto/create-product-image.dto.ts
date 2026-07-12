import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

function trimRequiredString({ value }: { value: unknown }): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

export class CreateProductImageDto {
  @ApiProperty({
    example:
      'https://project.supabase.co/storage/v1/object/public/homepage-images/product.jpg',
  })
  @Transform(trimRequiredString)
  @IsString()
  @IsUrl(
    {
      protocols: ['http', 'https'],
      require_protocol: true,
    },
    {
      message: 'Product image URL must be a valid URL',
    },
  )
  imageUrl!: string;

  @ApiProperty({
    example: 'homepage/2026/product-image.jpg',
    description:
      'The object path returned by the Supabase image upload endpoint',
  })
  @Transform(trimRequiredString)
  @IsString()
  @MinLength(1, {
    message: 'Product image public ID is required',
  })
  @MaxLength(1000, {
    message: 'Product image public ID is too long',
  })
  imagePublicId!: string;

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

  @ApiPropertyOptional({
    example: false,
    default: false,
    description: 'Whether this image should become the primary product image',
  })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}
