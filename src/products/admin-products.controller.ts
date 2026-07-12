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
import { CreateProductDto } from './dto/create-product.dto';
import { ReorderProductsDto } from './dto/reorder-products.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';

@ApiTags('Admin — Products')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('admin/products')
export class AdminProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({
    summary: 'Retrieve all products for administration',
  })
  @ApiOkResponse({
    description: 'Products retrieved successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Administrator authentication is required',
  })
  async findAll() {
    const products = await this.productsService.findAll();

    return {
      success: true,
      message: 'Products retrieved successfully',
      data: {
        products,
      },
    };
  }

  @Get(':id')
  @ApiOperation({
    summary:
      'Retrieve one product with its features, images, and price-list entries',
  })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'Product retrieved successfully',
  })
  @ApiNotFoundResponse({
    description: 'Product was not found',
  })
  async findOne(
    @Param('id', ParseUUIDPipe)
    id: string,
  ) {
    const product = await this.productsService.findOne(id);

    return {
      success: true,
      message: 'Product retrieved successfully',
      data: {
        product,
      },
    };
  }

  @Post()
  @ApiOperation({
    summary: 'Create a product or wood type',
  })
  @ApiCreatedResponse({
    description: 'Product created successfully',
  })
  @ApiBadRequestResponse({
    description: 'The submitted product information is invalid',
  })
  async create(
    @Body()
    createDto: CreateProductDto,
  ) {
    const product = await this.productsService.create(createDto);

    return {
      success: true,
      message: 'Product created successfully',
      data: {
        product,
      },
    };
  }

  /*
   * Keep this static route above PATCH :id.
   */
  @Patch('reorder')
  @ApiOperation({
    summary: 'Reorder all products',
  })
  @ApiOkResponse({
    description: 'Products reordered successfully',
  })
  @ApiBadRequestResponse({
    description: 'The product order is invalid',
  })
  async reorder(
    @Body()
    reorderDto: ReorderProductsDto,
  ) {
    const products = await this.productsService.reorder(reorderDto);

    return {
      success: true,
      message: 'Products reordered successfully',
      data: {
        products,
      },
    };
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a product or wood type',
  })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'Product updated successfully',
  })
  @ApiBadRequestResponse({
    description: 'The submitted product information is invalid',
  })
  @ApiNotFoundResponse({
    description: 'Product was not found',
  })
  async update(
    @Param('id', ParseUUIDPipe)
    id: string,

    @Body()
    updateDto: UpdateProductDto,
  ) {
    const product = await this.productsService.update(id, updateDto);

    return {
      success: true,
      message: 'Product updated successfully',
      data: {
        product,
      },
    };
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a product and its related features and images',
  })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'Product deleted successfully',
  })
  @ApiNotFoundResponse({
    description: 'Product was not found',
  })
  async remove(
    @Param('id', ParseUUIDPipe)
    id: string,
  ) {
    const product = await this.productsService.remove(id);

    return {
      success: true,
      message: 'Product deleted successfully',
      data: {
        product,
      },
    };
  }
}
