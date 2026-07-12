import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export enum ProductFeatureType {
  BENEFIT = 'BENEFIT',
  DRAWBACK = 'DRAWBACK',
}

function trimRequiredString({ value }: { value: unknown }): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

function normalizeFeatureType({ value }: { value: unknown }): unknown {
  return typeof value === 'string' ? value.trim().toUpperCase() : value;
}

export class CreateProductFeatureDto {
  @ApiProperty({
    example: 'High durability',
    maxLength: 255,
  })
  @Transform(trimRequiredString)
  @IsString()
  @MinLength(2, {
    message: 'Feature label must contain at least 2 characters',
  })
  @MaxLength(255, {
    message: 'Feature label must not exceed 255 characters',
  })
  label!: string;

  @ApiPropertyOptional({
    enum: ProductFeatureType,
    example: ProductFeatureType.BENEFIT,
    default: ProductFeatureType.BENEFIT,
    description: 'Whether the feature is a benefit or drawback of the product',
  })
  @Transform(normalizeFeatureType)
  @IsOptional()
  @IsEnum(ProductFeatureType, {
    message: 'Feature type must be either BENEFIT or DRAWBACK',
  })
  featureType?: ProductFeatureType;
}
