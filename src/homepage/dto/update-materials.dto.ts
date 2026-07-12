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

export class MaterialCardDto {
  @ApiProperty({
    example: 'Oak',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(150)
  name!: string;

  @ApiProperty({
    example:
      'Durable hardwood suitable for furniture, flooring, and interior projects.',
  })
  @IsString()
  @MinLength(1)
  description!: string;

  @ApiProperty({
    example: 'https://placehold.co/600x800?text=Oak',
  })
  @IsUrl(
    {
      require_protocol: true,
    },
    {
      message: 'Each material must have a valid image URL',
    },
  )
  imageUrl!: string;

  @ApiProperty({
    example: 'wood-cms/materials/oak',
  })
  @IsString()
  @MinLength(1)
  imagePublicId!: string;

  @ApiProperty({
    example: 'Oak wood material',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  altText!: string;
}

export class UpdateMaterialsDto {
  @ApiProperty({
    example: 'Materials We Work With',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  title!: string;

  @ApiProperty({
    type: [MaterialCardDto],
    description: 'Exactly three materials displayed on the homepage',
  })
  @IsArray()
  @ArrayMinSize(3, {
    message: 'The Materials section requires exactly 3 materials',
  })
  @ArrayMaxSize(3, {
    message: 'The Materials section requires exactly 3 materials',
  })
  @ValidateNested({
    each: true,
  })
  @Type(() => MaterialCardDto)
  materials!: MaterialCardDto[];
}
