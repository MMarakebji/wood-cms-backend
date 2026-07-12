import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, ArrayUnique, IsArray, IsUUID } from 'class-validator';

export class ReorderProductImagesDto {
  @ApiProperty({
    description: 'All product-image IDs in their desired order',
    example: [
      '3c00cdd9-eab2-4b49-af84-256df93e5421',
      '2ee175ac-970c-4e48-ae45-12fccfb7adcf',
    ],
    type: [String],
  })
  @IsArray()
  @ArrayNotEmpty({
    message: 'At least one product-image ID is required',
  })
  @ArrayUnique({
    message: 'The image ID list must not contain duplicates',
  })
  @IsUUID('4', {
    each: true,
    message: 'Each product-image ID must be a valid UUID',
  })
  imageIds!: string[];
}
