import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { PublicContentService } from './public-content.service';

@ApiTags('Public Content')
@Controller('public')
export class PublicContentController {
  constructor(private readonly publicContentService: PublicContentService) {}

  @Get('homepage')
  @ApiOperation({
    summary: 'Retrieve all active public homepage content',
  })
  @ApiOkResponse({
    description: 'Public homepage content retrieved successfully',
  })
  async getHomepage() {
    const content = await this.publicContentService.getHomepage();

    return {
      success: true,
      message: 'Public homepage content retrieved successfully',
      data: content,
    };
  }

  @Get('services')
  @ApiOperation({
    summary: 'Retrieve all active services',
  })
  @ApiOkResponse({
    description: 'Public services retrieved successfully',
  })
  async getServices() {
    const services = await this.publicContentService.getServices();

    return {
      success: true,
      message: 'Public services retrieved successfully',
      data: {
        services,
      },
    };
  }

  @Get('services/:slug')
  @ApiOperation({
    summary: 'Retrieve one active service by slug',
  })
  @ApiParam({
    name: 'slug',
    example: 'custom-wood-cutting',
  })
  @ApiOkResponse({
    description: 'Public service retrieved successfully',
  })
  @ApiNotFoundResponse({
    description: 'Active service was not found',
  })
  async getServiceBySlug(
    @Param('slug')
    slug: string,
  ) {
    const service = await this.publicContentService.getServiceBySlug(slug);

    return {
      success: true,
      message: 'Public service retrieved successfully',
      data: {
        service,
      },
    };
  }

  @Get('products')
  @ApiOperation({
    summary: 'Retrieve all active products with features, images, and prices',
  })
  @ApiOkResponse({
    description: 'Public products retrieved successfully',
  })
  async getProducts() {
    const products = await this.publicContentService.getProducts();

    return {
      success: true,
      message: 'Public products retrieved successfully',
      data: {
        products,
      },
    };
  }

  @Get('products/:slug')
  @ApiOperation({
    summary: 'Retrieve one active product by slug',
  })
  @ApiParam({
    name: 'slug',
    example: 'oak-wood',
  })
  @ApiOkResponse({
    description: 'Public product retrieved successfully',
  })
  @ApiNotFoundResponse({
    description: 'Active product was not found',
  })
  async getProductBySlug(
    @Param('slug')
    slug: string,
  ) {
    const product = await this.publicContentService.getProductBySlug(slug);

    return {
      success: true,
      message: 'Public product retrieved successfully',
      data: {
        product,
      },
    };
  }

  @Get('price-lists')
  @ApiOperation({
    summary: 'Retrieve all active public price-list rows',
  })
  @ApiOkResponse({
    description: 'Public price lists retrieved successfully',
  })
  async getPriceLists() {
    const priceLists = await this.publicContentService.getPriceLists();

    return {
      success: true,
      message: 'Public price lists retrieved successfully',
      data: {
        priceLists,
      },
    };
  }
}
