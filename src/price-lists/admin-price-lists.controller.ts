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
import { CreatePriceListDto } from './dto/create-price-list.dto';
import { ReorderPriceListsDto } from './dto/reorder-price-lists.dto';
import { UpdatePriceListDto } from './dto/update-price-list.dto';
import { PriceListsService } from './price-lists.service';

@ApiTags('Admin — Price Lists')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('admin/price-lists')
export class AdminPriceListsController {
  constructor(private readonly priceListsService: PriceListsService) {}

  @Get()
  @ApiOperation({
    summary: 'Retrieve all price-list rows',
  })
  @ApiOkResponse({
    description: 'Price-list rows retrieved successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Administrator authentication is required',
  })
  async findAll() {
    const priceLists = await this.priceListsService.findAll();

    return {
      success: true,
      message: 'Price-list rows retrieved successfully',
      data: {
        priceLists,
      },
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Retrieve one price-list row',
  })
  @ApiParam({
    name: 'id',
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'Price-list row retrieved successfully',
  })
  @ApiNotFoundResponse({
    description: 'Price-list row was not found',
  })
  async findOne(
    @Param('id', ParseUUIDPipe)
    id: string,
  ) {
    const priceList = await this.priceListsService.findOne(id);

    return {
      success: true,
      message: 'Price-list row retrieved successfully',
      data: {
        priceList,
      },
    };
  }

  @Post()
  @ApiOperation({
    summary: 'Create a price-list row',
  })
  @ApiCreatedResponse({
    description: 'Price-list row created successfully',
  })
  @ApiBadRequestResponse({
    description: 'The submitted price-list information is invalid',
  })
  @ApiNotFoundResponse({
    description: 'The selected product was not found',
  })
  async create(
    @Body()
    createDto: CreatePriceListDto,
  ) {
    const priceList = await this.priceListsService.create(createDto);

    return {
      success: true,
      message: 'Price-list row created successfully',
      data: {
        priceList,
      },
    };
  }

  /*
   * Keep this static path before
   * the dynamic :id update path.
   */
  @Patch('reorder')
  @ApiOperation({
    summary: 'Reorder all price-list rows',
  })
  @ApiOkResponse({
    description: 'Price-list rows reordered successfully',
  })
  @ApiBadRequestResponse({
    description: 'The submitted price-list order is invalid',
  })
  async reorder(
    @Body()
    reorderDto: ReorderPriceListsDto,
  ) {
    const priceLists = await this.priceListsService.reorder(reorderDto);

    return {
      success: true,
      message: 'Price-list rows reordered successfully',
      data: {
        priceLists,
      },
    };
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a price-list row',
  })
  @ApiParam({
    name: 'id',
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'Price-list row updated successfully',
  })
  @ApiNotFoundResponse({
    description: 'Price-list row or selected product was not found',
  })
  async update(
    @Param('id', ParseUUIDPipe)
    id: string,

    @Body()
    updateDto: UpdatePriceListDto,
  ) {
    const priceList = await this.priceListsService.update(id, updateDto);

    return {
      success: true,
      message: 'Price-list row updated successfully',
      data: {
        priceList,
      },
    };
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a price-list row',
  })
  @ApiParam({
    name: 'id',
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'Price-list row deleted successfully',
  })
  @ApiNotFoundResponse({
    description: 'Price-list row was not found',
  })
  async remove(
    @Param('id', ParseUUIDPipe)
    id: string,
  ) {
    const priceList = await this.priceListsService.remove(id);

    return {
      success: true,
      message: 'Price-list row deleted successfully',
      data: {
        priceList,
      },
    };
  }
}
