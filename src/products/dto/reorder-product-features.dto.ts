import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, ArrayUnique, IsArray, IsUUID } from 'class-validator';

export class ReorderProductFeaturesDto {
  @ApiProperty({
    description: 'All feature IDs for the product in their desired order',
    example: [
      '3c00cdd9-eab2-4b49-af84-256df93e5421',
      '2ee175ac-970c-4e48-ae45-12fccfb7adcf',
    ],
    type: [String],
  })
  @IsArray()
  @ArrayNotEmpty({
    message: 'At least one product feature ID is required',
  })
  @ArrayUnique({
    message: 'The feature ID list must not contain duplicates',
  })
  @IsUUID('4', {
    each: true,
    message: 'Each feature ID must be a valid UUID',
  })
  featureIds!: string[];
}
