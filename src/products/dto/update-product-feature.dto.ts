import { PartialType } from '@nestjs/swagger';
import { CreateProductFeatureDto } from './create-product-feature.dto';

export class UpdateProductFeatureDto extends PartialType(
  CreateProductFeatureDto,
) {}
