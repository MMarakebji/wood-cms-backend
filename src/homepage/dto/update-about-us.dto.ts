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

export class AboutUsImageDto {
  @ApiProperty({
    example: 'https://placehold.co/700x900?text=About+Us+Image',
  })
  @IsUrl(
    {
      require_protocol: true,
    },
    {
      message: 'Each About Us image must have a valid URL',
    },
  )
  imageUrl!: string;

  @ApiProperty({
    example: 'wood-cms/homepage/about-us/image-1',
  })
  @IsString()
  @MinLength(1)
  imagePublicId!: string;

  @ApiProperty({
    example: 'Woodworking team inside the workshop',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  altText!: string;
}

export class UpdateAboutUsDto {
  @ApiProperty({
    example: 'About Us',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  title!: string;

  @ApiProperty({
    example:
      'We create high-quality wooden products using carefully selected materials and professional craftsmanship.',
  })
  @IsString()
  @MinLength(1)
  description!: string;

  @ApiProperty({
    type: [AboutUsImageDto],
    description: 'Exactly three images displayed in the About Us section',
  })
  @IsArray()
  @ArrayMinSize(3, {
    message: 'The About Us section requires exactly 3 images',
  })
  @ArrayMaxSize(3, {
    message: 'The About Us section requires exactly 3 images',
  })
  @ValidateNested({
    each: true,
  })
  @Type(() => AboutUsImageDto)
  images!: AboutUsImageDto[];
}
