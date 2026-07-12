import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class WhatWeOfferImageDto {
  @ApiProperty({
    example: 'https://placehold.co/600x400?text=Wood+Product',
  })
  @IsUrl(
    {
      require_protocol: true,
    },
    {
      message: 'Each image must have a valid URL',
    },
  )
  imageUrl!: string;

  @ApiProperty({
    example: 'wood-cms/homepage/what-we-offer-1',
  })
  @IsString()
  @MinLength(1)
  imagePublicId!: string;

  @ApiProperty({
    example: 'Solid wooden table',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  altText!: string;
}

export class UpdateWhatWeOfferDto {
  @ApiProperty({
    example: 'Solid Wood Products',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  title!: string;

  @ApiProperty({
    example: 'Oak, beech and ash wood products available for your project.',
  })
  @IsString()
  @MinLength(1)
  description!: string;

  @ApiProperty({
    example: 'Order',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  buttonText!: string;

  @ApiProperty({
    example: '#contact',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  buttonLink!: string;

  @ApiProperty({
    type: [WhatWeOfferImageDto],
    description: 'Exactly three images displayed in the section',
  })
  @IsArray()
  @ArrayMinSize(3, {
    message: 'The What We Offer section requires exactly 3 images',
  })
  @ArrayMaxSize(3, {
    message: 'The What We Offer section requires exactly 3 images',
  })
  @ValidateNested({
    each: true,
  })
  @Type(() => WhatWeOfferImageDto)
  images!: WhatWeOfferImageDto[];
}
