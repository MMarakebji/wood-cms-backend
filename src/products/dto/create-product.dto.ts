import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
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

function normalizeOptionalPrice({ value }: { value: unknown }): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === 'number') {
    return String(value);
  }

  if (typeof value === 'string') {
    const trimmedValue = value.trim();

    return trimmedValue.length > 0 ? trimmedValue : null;
  }

  return value;
}

function normalizeCurrency({ value }: { value: unknown }): unknown {
  return typeof value === 'string' ? value.trim().toUpperCase() : value;
}

export class CreateProductDto {
  @ApiProperty({
    example: 'Oak Wood',
    maxLength: 160,
  })
  @Transform(trimRequiredString)
  @IsString()
  @MinLength(2, {
    message: 'Product name must contain at least 2 characters',
  })
  @MaxLength(160, {
    message: 'Product name must not exceed 160 characters',
  })
  name!: string;

  @ApiPropertyOptional({
    example: 'oak-wood',
    maxLength: 180,
    description:
      'Optional URL slug. It is generated from the product name when omitted.',
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
    example: 'Durable hardwood suitable for furniture and flooring.',
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
      'Oak is a strong and durable hardwood commonly used for furniture, flooring, and interior projects.',
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
    example: '950.00',
    nullable: true,
    description: 'Optional base price with a maximum of two decimal places',
  })
  @Transform(normalizeOptionalPrice)
  @IsOptional()
  @IsString()
  @Matches(/^\d{1,10}(?:\.\d{1,2})?$/, {
    message:
      'Base price must be a positive number with no more than two decimal places',
  })
  basePrice?: string | null;

  @ApiPropertyOptional({
    example: 'CZK',
    default: 'CZK',
    maxLength: 3,
  })
  @Transform(normalizeCurrency)
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{3}$/, {
    message: 'Currency must contain exactly three uppercase letters',
  })
  currency?: string;

  @ApiPropertyOptional({
    example: 'per m³',
    nullable: true,
    maxLength: 40,
  })
  @Transform(normalizeOptionalString)
  @IsOptional()
  @IsString()
  @MaxLength(40, {
    message: 'Price unit must not exceed 40 characters',
  })
  priceUnit?: string | null;

  @ApiPropertyOptional({
    example: 1,
    minimum: 0,
    description: 'Position in which the product is displayed',
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
