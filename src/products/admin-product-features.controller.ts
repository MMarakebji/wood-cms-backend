import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateProductFeatureDto } from './dto/create-product-feature.dto';
import { ReorderProductFeaturesDto } from './dto/reorder-product-features.dto';
import { UpdateProductFeatureDto } from './dto/update-product-feature.dto';
import { ProductFeaturesService } from './product-features.service';

@ApiTags('Admin — Product Features')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('admin/products')
export class AdminProductFeaturesController {
  constructor(
    private readonly productFeaturesService: ProductFeaturesService,
  ) {}

  @Get(':productId/features')
  @ApiOperation({
    summary: 'Retrieve all features belonging to a product',
  })
  @ApiParam({
    name: 'productId',
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'Product features retrieved successfully',
  })
  @ApiNotFoundResponse({
    description: 'Product was not found',
  })
  @ApiUnauthorizedResponse({
    description: 'Administrator authentication is required',
  })
  async findAll(
    @Param('productId', ParseUUIDPipe)
    productId: string,
  ) {
    const features = await this.productFeaturesService.findAll(productId);

    return {
      success: true,
      message: 'Product features retrieved successfully',
      data: {
        features,
      },
    };
  }

  @Get(':productId/features/:featureId')
  @ApiOperation({
    summary: 'Retrieve one product feature',
  })
  @ApiParam({
    name: 'productId',
    format: 'uuid',
  })
  @ApiParam({
    name: 'featureId',
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'Product feature retrieved successfully',
  })
  @ApiNotFoundResponse({
    description: 'Product or product feature was not found',
  })
  async findOne(
    @Param('productId', ParseUUIDPipe)
    productId: string,

    @Param('featureId', ParseUUIDPipe)
    featureId: string,
  ) {
    const feature = await this.productFeaturesService.findOne(
      productId,
      featureId,
    );

    return {
      success: true,
      message: 'Product feature retrieved successfully',
      data: {
        feature,
      },
    };
  }

  @Post(':productId/features')
  @ApiOperation({
    summary: 'Create a feature for a product',
  })
  @ApiParam({
    name: 'productId',
    format: 'uuid',
  })
  @ApiCreatedResponse({
    description: 'Product feature created successfully',
  })
  @ApiBadRequestResponse({
    description: 'The submitted feature information is invalid',
  })
  @ApiNotFoundResponse({
    description: 'Product was not found',
  })
  async create(
    @Param('productId', ParseUUIDPipe)
    productId: string,

    @Body()
    createDto: CreateProductFeatureDto,
  ) {
    const feature = await this.productFeaturesService.create(
      productId,
      createDto,
    );

    return {
      success: true,
      message: 'Product feature created successfully',
      data: {
        feature,
      },
    };
  }

  /*
   * Keep the static reorder path above
   * the dynamic featureId path.
   */
  @Patch(':productId/features/reorder')
  @ApiOperation({
    summary: 'Reorder all features belonging to a product',
  })
  @ApiParam({
    name: 'productId',
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'Product features reordered successfully',
  })
  @ApiBadRequestResponse({
    description: 'The feature order is invalid',
  })
  @ApiNotFoundResponse({
    description: 'Product was not found',
  })
  async reorder(
    @Param('productId', ParseUUIDPipe)
    productId: string,

    @Body()
    reorderDto: ReorderProductFeaturesDto,
  ) {
    const features = await this.productFeaturesService.reorder(
      productId,
      reorderDto,
    );

    return {
      success: true,
      message: 'Product features reordered successfully',
      data: {
        features,
      },
    };
  }

  @Patch(':productId/features/:featureId')
  @ApiOperation({
    summary: 'Update a product feature',
  })
  @ApiParam({
    name: 'productId',
    format: 'uuid',
  })
  @ApiParam({
    name: 'featureId',
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'Product feature updated successfully',
  })
  @ApiNotFoundResponse({
    description: 'Product or product feature was not found',
  })
  async update(
    @Param('productId', ParseUUIDPipe)
    productId: string,

    @Param('featureId', ParseUUIDPipe)
    featureId: string,

    @Body()
    updateDto: UpdateProductFeatureDto,
  ) {
    const feature = await this.productFeaturesService.update(
      productId,
      featureId,
      updateDto,
    );

    return {
      success: true,
      message: 'Product feature updated successfully',
      data: {
        feature,
      },
    };
  }

  @Delete(':productId/features/:featureId')
  @ApiOperation({
    summary: 'Delete a product feature',
  })
  @ApiParam({
    name: 'productId',
    format: 'uuid',
  })
  @ApiParam({
    name: 'featureId',
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'Product feature deleted successfully',
  })
  @ApiNotFoundResponse({
    description: 'Product or product feature was not found',
  })
  async remove(
    @Param('productId', ParseUUIDPipe)
    productId: string,

    @Param('featureId', ParseUUIDPipe)
    featureId: string,
  ) {
    const feature = await this.productFeaturesService.remove(
      productId,
      featureId,
    );

    return {
      success: true,
      message: 'Product feature deleted successfully',
      data: {
        feature,
      },
    };
  }
}
