import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateProductPhotosDto } from './dto/update-product-photos.dto';
import { ProductPhotosService } from './product-photos.service';

@ApiTags('Admin — Product Photos')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('admin/homepage/product-photos')
export class ProductPhotosController {
  constructor(private readonly productPhotosService: ProductPhotosService) {}

  @Get()
  @ApiOperation({
    summary: 'Retrieve the Product Photos carousel section',
  })
  @ApiOkResponse({
    description: 'Product Photos section retrieved successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Administrator authentication is required',
  })
  @ApiNotFoundResponse({
    description: 'Product Photos section was not found',
  })
  async getSection() {
    const section = await this.productPhotosService.getSection();

    return {
      success: true,
      message: 'Product Photos section retrieved successfully',
      data: {
        section,
      },
    };
  }

  @Patch()
  @ApiOperation({
    summary: 'Update the Product Photos title and carousel images',
  })
  @ApiOkResponse({
    description: 'Product Photos section updated successfully',
  })
  @ApiBadRequestResponse({
    description: 'The submitted gallery data is invalid',
  })
  @ApiUnauthorizedResponse({
    description: 'Administrator authentication is required',
  })
  @ApiNotFoundResponse({
    description: 'Product Photos section was not found',
  })
  async updateSection(
    @Body()
    updateDto: UpdateProductPhotosDto,
  ) {
    const section = await this.productPhotosService.updateSection(updateDto);

    return {
      success: true,
      message: 'Product Photos section updated successfully',
      data: {
        section,
      },
    };
  }
}
