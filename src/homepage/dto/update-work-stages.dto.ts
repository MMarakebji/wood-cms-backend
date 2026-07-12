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

export class WorkStageDto {
  @ApiProperty({
    example: 'Contact our team and describe the product or service you need.',
  })
  @IsString()
  @MinLength(1)
  description!: string;
}

export class WorkStagesImageDto {
  @ApiProperty({
    example: 'https://placehold.co/900x700?text=Work+Stages',
  })
  @IsUrl(
    {
      require_protocol: true,
    },
    {
      message: 'The section image must have a valid URL',
    },
  )
  imageUrl!: string;

  @ApiProperty({
    example: 'wood-cms/homepage/work-stages',
  })
  @IsString()
  @MinLength(1)
  imagePublicId!: string;

  @ApiProperty({
    example: 'Woodworking professional preparing a product',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  altText!: string;
}

export class UpdateWorkStagesDto {
  @ApiProperty({
    example: 'Stages of Working With Us',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  title!: string;

  @ApiProperty({
    type: WorkStagesImageDto,
  })
  @ValidateNested()
  @Type(() => WorkStagesImageDto)
  image!: WorkStagesImageDto;

  @ApiProperty({
    type: [WorkStageDto],
    description: 'Exactly three descriptions displayed beside the image',
  })
  @IsArray()
  @ArrayMinSize(3, {
    message: 'The Work Stages section requires exactly 3 descriptions',
  })
  @ArrayMaxSize(3, {
    message: 'The Work Stages section requires exactly 3 descriptions',
  })
  @ValidateNested({
    each: true,
  })
  @Type(() => WorkStageDto)
  stages!: WorkStageDto[];

  @ApiProperty({
    example: 'Order Now',
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
}
