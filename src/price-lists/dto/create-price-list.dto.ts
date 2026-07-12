import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

function trimRequiredString({ value }: { value: unknown }): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

function normalizeOptionalString({ value }: { value: unknown }): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value !== 'string') {
    return value;
  }

  const trimmedValue = value.trim();

  return trimmedValue.length > 0 ? trimmedValue : null;
}

function normalizeOptionalUuid({ value }: { value: unknown }): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value !== 'string') {
    return value;
  }

  const trimmedValue = value.trim();

  return trimmedValue.length > 0 ? trimmedValue : null;
}

function normalizeOptionalDecimal({ value }: { value: unknown }): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === 'number') {
    return String(value);
  }

  if (typeof value !== 'string') {
    return value;
  }

  const trimmedValue = value.trim();

  return trimmedValue.length > 0 ? trimmedValue : null;
}

function normalizeCurrency({ value }: { value: unknown }): unknown {
  return typeof value === 'string' ? value.trim().toUpperCase() : value;
}

export class CreatePriceListDto {
  @ApiPropertyOptional({
    example: '4e155da1-0345-4454-b7f2-4a73f13b312f',
    nullable: true,
    format: 'uuid',
    description: 'Optional product related to this price row',
  })
  @Transform(normalizeOptionalUuid)
  @IsOptional()
  @IsUUID('4', {
    message: 'Product ID must be a valid UUID',
  })
  productId?: string | null;

  @ApiProperty({
    example: 'Oak PR',
    maxLength: 160,
  })
  @Transform(trimRequiredString)
  @IsString()
  @MinLength(2, {
    message: 'List name must contain at least 2 characters',
  })
  @MaxLength(160, {
    message: 'List name must not exceed 160 characters',
  })
  listName!: string;

  @ApiPropertyOptional({
    example: 'Oak board 50 × 100 mm',
    nullable: true,
    maxLength: 160,
  })
  @Transform(normalizeOptionalString)
  @IsOptional()
  @IsString()
  @MaxLength(160, {
    message: 'Item name must not exceed 160 characters',
  })
  itemName?: string | null;

  @ApiPropertyOptional({
    example: 3000,
    nullable: true,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({
    message: 'Length must be a whole number',
  })
  @Min(1, {
    message: 'Length must be greater than zero',
  })
  lengthMm?: number | null;

  @ApiPropertyOptional({
    example: 100,
    nullable: true,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({
    message: 'Width must be a whole number',
  })
  @Min(1, {
    message: 'Width must be greater than zero',
  })
  widthMm?: number | null;

  @ApiPropertyOptional({
    example: 50,
    nullable: true,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({
    message: 'Thickness must be a whole number',
  })
  @Min(1, {
    message: 'Thickness must be greater than zero',
  })
  thicknessMm?: number | null;

  @ApiPropertyOptional({
    example: '0.0150',
    nullable: true,
    description: 'Volume in cubic metres with up to four decimal places',
  })
  @Transform(normalizeOptionalDecimal)
  @IsOptional()
  @IsString()
  @Matches(/^\d{1,6}(?:\.\d{1,4})?$/, {
    message:
      'Volume must be non-negative and contain no more than four decimal places',
  })
  volumeM3?: string | null;

  @ApiPropertyOptional({
    example: '950.00',
    nullable: true,
    description: 'Price per cubic metre with up to two decimal places',
  })
  @Transform(normalizeOptionalDecimal)
  @IsOptional()
  @IsString()
  @Matches(/^\d{1,10}(?:\.\d{1,2})?$/, {
    message:
      'Price per cubic metre must be non-negative and contain no more than two decimal places',
  })
  pricePerM3?: string | null;

  @ApiPropertyOptional({
    example: '14.25',
    nullable: true,
    description: 'Price per piece with up to two decimal places',
  })
  @Transform(normalizeOptionalDecimal)
  @IsOptional()
  @IsString()
  @Matches(/^\d{1,10}(?:\.\d{1,2})?$/, {
    message:
      'Price per piece must be non-negative and contain no more than two decimal places',
  })
  pricePerPiece?: string | null;

  @ApiPropertyOptional({
    example: 'CZK',
    default: 'CZK',
  })
  @Transform(normalizeCurrency)
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{3}$/, {
    message: 'Currency must contain exactly three uppercase letters',
  })
  currency?: string;

  @ApiPropertyOptional({
    example: 1,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0, {
    message: 'Display order cannot be negative',
  })
  displayOrder?: number;

  @ApiPropertyOptional({
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
