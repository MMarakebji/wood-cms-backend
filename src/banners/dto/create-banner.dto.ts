import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

function trimRequiredString({ value }: { value: unknown }): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

function normalizeOptionalString({ value }: { value: unknown }): unknown {
  if (typeof value !== 'string') {
    return value;
  }

  const trimmedValue = value.trim();

  return trimmedValue.length > 0 ? trimmedValue : null;
}

export class CreateBannerDto {
  @ApiProperty({
    example: 'Premium Wood Products',
    maxLength: 255,
  })
  @Transform(trimRequiredString)
  @IsString()
  @MinLength(1, {
    message: 'Banner title is required',
  })
  @MaxLength(255, {
    message: 'Banner title must not exceed 255 characters',
  })
  title!: string;

  @ApiPropertyOptional({
    example: 'Natural materials for exceptional projects',
    nullable: true,
    maxLength: 255,
  })
  @Transform(normalizeOptionalString)
  @IsOptional()
  @IsString()
  @MaxLength(255)
  subtitle?: string | null;

  @ApiPropertyOptional({
    example: 'Discover our collection of carefully selected wood products.',
    nullable: true,
  })
  @Transform(normalizeOptionalString)
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiPropertyOptional({
    example: 'View Products',
    nullable: true,
    maxLength: 100,
  })
  @Transform(normalizeOptionalString)
  @IsOptional()
  @IsString()
  @MaxLength(100)
  buttonText?: string | null;

  @ApiPropertyOptional({
    example: '/products',
    nullable: true,
    maxLength: 255,
  })
  @Transform(normalizeOptionalString)
  @IsOptional()
  @IsString()
  @MaxLength(255)
  buttonLink?: string | null;

  @ApiProperty({
    example:
      'https://project.supabase.co/storage/v1/object/public/homepage-images/banner.jpg',
  })
  @Transform(trimRequiredString)
  @IsString()
  @IsUrl(
    {
      protocols: ['http', 'https'],
      require_protocol: true,
    },
    {
      message: 'Banner image URL must be a valid URL',
    },
  )
  imageUrl!: string;

  @ApiProperty({
    example: 'homepage/2026/banner-image.jpg',
  })
  @Transform(trimRequiredString)
  @IsString()
  @MinLength(1, {
    message: 'Banner image public ID is required',
  })
  @MaxLength(1000)
  imagePublicId!: string;

  @ApiProperty({
    example: 'Wooden boards displayed in a workshop',
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
  imageAltText!: string;

  @ApiPropertyOptional({
    example: 1,
    minimum: 0,
    description: 'Position in which the banner is displayed',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  displayOrder?: number;

  @ApiPropertyOptional({
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
