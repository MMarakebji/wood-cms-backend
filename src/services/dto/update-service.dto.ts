import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateServiceDto } from './create-service.dto';

export class UpdateServiceDto extends PartialType(CreateServiceDto) {
  @ApiPropertyOptional({
    example: false,
    default: false,
    description: 'Set to true to remove the current service image',
  })
  @IsOptional()
  @IsBoolean()
  removeImage?: boolean;
}
