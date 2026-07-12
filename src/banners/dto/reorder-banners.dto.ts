import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, ArrayUnique, IsArray, IsUUID } from 'class-validator';

export class ReorderBannersDto {
  @ApiProperty({
    description: 'All banner IDs arranged in their desired display order',
    example: [
      '3c00cdd9-eab2-4b49-af84-256df93e5421',
      '2ee175ac-970c-4e48-ae45-12fccfb7adcf',
    ],
    type: [String],
  })
  @IsArray()
  @ArrayNotEmpty({
    message: 'At least one banner ID is required',
  })
  @ArrayUnique({
    message: 'The banner ID list must not contain duplicates',
  })
  @IsUUID('4', {
    each: true,
    message: 'Each banner ID must be a valid UUID',
  })
  bannerIds!: string[];
}
