import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
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

function normalizeSlug({ value }: { value: unknown }): unknown {
  if (typeof value !== 'string') {
    return value;
  }

  const normalizedValue = value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return normalizedValue.length > 0 ? normalizedValue : undefined;
}

export class CreateServiceDto {
  @ApiProperty({
    example: 'Custom Furniture Production',
    maxLength: 160,
  })
  @Transform(trimRequiredString)
  @IsString()
  @MinLength(2, {
    message: 'Service name must contain at least 2 characters',
  })
  @MaxLength(160, {
    message: 'Service name must not exceed 160 characters',
  })
  name!: string;

  @ApiPropertyOptional({
    example: 'custom-furniture-production',
    maxLength: 180,
    description:
      'Optional URL-friendly slug. It is generated from the service name when omitted.',
  })
  @Transform(normalizeSlug)
  @IsOptional()
  @IsString()
  @MaxLength(180)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug can contain lowercase letters, numbers, and hyphens only',
  })
  slug?: string;

  @ApiPropertyOptional({
    example: 'Custom wooden furniture designed for homes and businesses.',
    nullable: true,
    maxLength: 500,
  })
  @Transform(normalizeOptionalString)
  @IsOptional()
  @IsString()
  @MaxLength(500, {
    message: 'Short description must not exceed 500 characters',
  })
  shortDescription?: string | null;

  @ApiPropertyOptional({
    example:
      'We design and manufacture custom wooden furniture according to customer requirements.',
    nullable: true,
  })
  @Transform(normalizeOptionalString)
  @IsOptional()
  @IsString()
  @MaxLength(10000, {
    message: 'Description must not exceed 10000 characters',
  })
  description?: string | null;

  @ApiPropertyOptional({
    example:
      'https://project.supabase.co/storage/v1/object/public/homepage-images/service.jpg',
    nullable: true,
  })
  @Transform(normalizeOptionalString)
  @IsOptional()
  @IsUrl(
    {
      protocols: ['http', 'https'],
      require_protocol: true,
    },
    {
      message: 'Service image URL must be a valid URL',
    },
  )
  imageUrl?: string | null;

  @ApiPropertyOptional({
    example: 'homepage/2026/service-image.jpg',
    nullable: true,
  })
  @Transform(normalizeOptionalString)
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  imagePublicId?: string | null;

  @ApiPropertyOptional({
    example: 'Craftsperson working on a custom wooden table',
    nullable: true,
    maxLength: 255,
  })
  @Transform(normalizeOptionalString)
  @IsOptional()
  @IsString()
  @MaxLength(255, {
    message: 'Image alternative text must not exceed 255 characters',
  })
  imageAltText?: string | null;

  @ApiPropertyOptional({
    example: 1,
    minimum: 0,
    description: 'Position in which the service is displayed',
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
