import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class ProductPhotoDto {
  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Existing image ID. Leave it empty for a new image.',
  })
  @IsOptional()
  @IsUUID()
  id?: string;

  @ApiProperty({
    example: 'https://placehold.co/1200x800?text=Product+Photo',
  })
  @IsUrl(
    {
      require_protocol: true,
    },
    {
      message: 'Each photo must have a valid URL',
    },
  )
  imageUrl!: string;

  @ApiProperty({
    example: 'wood-cms/product-photos/photo-1',
  })
  @IsString()
  @MinLength(1)
  imagePublicId!: string;

  @ApiProperty({
    example: 'Completed wooden interior project',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  altText!: string;

  @ApiPropertyOptional({
    example: 'Custom wooden interior',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  caption?: string | null;
}

export class UpdateProductPhotosDto {
  @ApiProperty({
    example: 'Product Photos',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  title!: string;

  @ApiProperty({
    type: [ProductPhotoDto],
    description: 'Ordered photos displayed inside the homepage carousel',
  })
  @IsArray()
  @ArrayMinSize(1, {
    message: 'The Product Photos section requires at least one image',
  })
  @ArrayMaxSize(20, {
    message: 'The Product Photos section supports a maximum of 20 images',
  })
  @ValidateNested({
    each: true,
  })
  @Type(() => ProductPhotoDto)
  images!: ProductPhotoDto[];
}
