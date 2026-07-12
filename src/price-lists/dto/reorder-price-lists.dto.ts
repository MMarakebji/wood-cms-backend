import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, ArrayUnique, IsArray, IsUUID } from 'class-validator';

export class ReorderPriceListsDto {
  @ApiProperty({
    type: [String],
    description: 'All price-list row IDs in their desired order',
    example: [
      '3c00cdd9-eab2-4b49-af84-256df93e5421',
      '2ee175ac-970c-4e48-ae45-12fccfb7adcf',
    ],
  })
  @IsArray()
  @ArrayNotEmpty({
    message: 'At least one price-list ID is required',
  })
  @ArrayUnique({
    message: 'The price-list IDs must not contain duplicates',
  })
  @IsUUID('4', {
    each: true,
    message: 'Each price-list ID must be a valid UUID',
  })
  priceListIds!: string[];
}
