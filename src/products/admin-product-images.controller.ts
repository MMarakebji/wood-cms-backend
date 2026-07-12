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
import { CreateProductImageDto } from './dto/create-product-image.dto';
import { ReorderProductImagesDto } from './dto/reorder-product-images.dto';
import { UpdateProductImageDto } from './dto/update-product-image.dto';
import { ProductImagesService } from './product-images.service';

@ApiTags('Admin — Product Images')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('admin/products')
export class AdminProductImagesController {
  constructor(private readonly productImagesService: ProductImagesService) {}

  @Get(':productId/images')
  @ApiOperation({
    summary: 'Retrieve all images belonging to a product',
  })
  @ApiParam({
    name: 'productId',
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'Product images retrieved successfully',
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
    const images = await this.productImagesService.findAll(productId);

    return {
      success: true,
      message: 'Product images retrieved successfully',
      data: {
        images,
      },
    };
  }

  @Post(':productId/images')
  @ApiOperation({
    summary: 'Register an uploaded image under a product',
  })
  @ApiParam({
    name: 'productId',
    format: 'uuid',
  })
  @ApiCreatedResponse({
    description: 'Product image created successfully',
  })
  @ApiBadRequestResponse({
    description: 'The submitted product-image information is invalid',
  })
  @ApiNotFoundResponse({
    description: 'Product was not found',
  })
  async create(
    @Param('productId', ParseUUIDPipe)
    productId: string,

    @Body()
    createDto: CreateProductImageDto,
  ) {
    const image = await this.productImagesService.create(productId, createDto);

    return {
      success: true,
      message: 'Product image created successfully',
      data: {
        image,
      },
    };
  }

  /*
   * Keep static paths before the dynamic
   * image update path.
   */
  @Patch(':productId/images/reorder')
  @ApiOperation({
    summary: 'Reorder all images belonging to a product',
  })
  @ApiParam({
    name: 'productId',
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'Product images reordered successfully',
  })
  @ApiBadRequestResponse({
    description: 'The product-image order is invalid',
  })
  async reorder(
    @Param('productId', ParseUUIDPipe)
    productId: string,

    @Body()
    reorderDto: ReorderProductImagesDto,
  ) {
    const images = await this.productImagesService.reorder(
      productId,
      reorderDto,
    );

    return {
      success: true,
      message: 'Product images reordered successfully',
      data: {
        images,
      },
    };
  }

  @Patch(':productId/images/:imageId/primary')
  @ApiOperation({
    summary: 'Set an image as the primary product image',
  })
  @ApiParam({
    name: 'productId',
    format: 'uuid',
  })
  @ApiParam({
    name: 'imageId',
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'Primary product image updated successfully',
  })
  @ApiNotFoundResponse({
    description: 'Product image was not found',
  })
  async setPrimary(
    @Param('productId', ParseUUIDPipe)
    productId: string,

    @Param('imageId', ParseUUIDPipe)
    imageId: string,
  ) {
    const image = await this.productImagesService.setPrimary(
      productId,
      imageId,
    );

    return {
      success: true,
      message: 'Primary product image updated successfully',
      data: {
        image,
      },
    };
  }

  @Patch(':productId/images/:imageId')
  @ApiOperation({
    summary: 'Update product-image alternative text',
  })
  @ApiParam({
    name: 'productId',
    format: 'uuid',
  })
  @ApiParam({
    name: 'imageId',
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'Product image updated successfully',
  })
  @ApiNotFoundResponse({
    description: 'Product image was not found',
  })
  async update(
    @Param('productId', ParseUUIDPipe)
    productId: string,

    @Param('imageId', ParseUUIDPipe)
    imageId: string,

    @Body()
    updateDto: UpdateProductImageDto,
  ) {
    const image = await this.productImagesService.update(
      productId,
      imageId,
      updateDto,
    );

    return {
      success: true,
      message: 'Product image updated successfully',
      data: {
        image,
      },
    };
  }

  @Delete(':productId/images/:imageId')
  @ApiOperation({
    summary: 'Delete a product image from the database and storage',
  })
  @ApiParam({
    name: 'productId',
    format: 'uuid',
  })
  @ApiParam({
    name: 'imageId',
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'Product image deleted successfully',
  })
  @ApiNotFoundResponse({
    description: 'Product image was not found',
  })
  async remove(
    @Param('productId', ParseUUIDPipe)
    productId: string,

    @Param('imageId', ParseUUIDPipe)
    imageId: string,
  ) {
    const image = await this.productImagesService.remove(productId, imageId);

    return {
      success: true,
      message: 'Product image deleted successfully',
      data: {
        image,
      },
    };
  }
}
