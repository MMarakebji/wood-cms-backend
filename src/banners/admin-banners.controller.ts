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
import { BannersService } from './banners.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { ReorderBannersDto } from './dto/reorder-banners.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';

@ApiTags('Admin — Banners')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('admin/banners')
export class AdminBannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Get()
  @ApiOperation({
    summary: 'Retrieve all banners for administration',
  })
  @ApiOkResponse({
    description: 'Banners retrieved successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Administrator authentication is required',
  })
  async findAll() {
    const banners = await this.bannersService.findAll();

    return {
      success: true,
      message: 'Banners retrieved successfully',
      data: {
        banners,
      },
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Retrieve one banner by ID',
  })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'Banner retrieved successfully',
  })
  @ApiNotFoundResponse({
    description: 'Banner was not found',
  })
  async findOne(
    @Param('id', ParseUUIDPipe)
    id: string,
  ) {
    const banner = await this.bannersService.findOne(id);

    return {
      success: true,
      message: 'Banner retrieved successfully',
      data: {
        banner,
      },
    };
  }

  @Post()
  @ApiOperation({
    summary: 'Create a banner',
  })
  @ApiCreatedResponse({
    description: 'Banner created successfully',
  })
  @ApiBadRequestResponse({
    description: 'The submitted banner information is invalid',
  })
  async create(
    @Body()
    createDto: CreateBannerDto,
  ) {
    const banner = await this.bannersService.create(createDto);

    return {
      success: true,
      message: 'Banner created successfully',
      data: {
        banner,
      },
    };
  }

  /*
   * This static route must remain above
   * the dynamic PATCH :id route.
   */
  @Patch('reorder')
  @ApiOperation({
    summary: 'Reorder all banners',
  })
  @ApiOkResponse({
    description: 'Banners reordered successfully',
  })
  @ApiBadRequestResponse({
    description: 'The reorder list is invalid',
  })
  async reorder(
    @Body()
    reorderDto: ReorderBannersDto,
  ) {
    const banners = await this.bannersService.reorder(reorderDto);

    return {
      success: true,
      message: 'Banners reordered successfully',
      data: {
        banners,
      },
    };
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a banner',
  })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'Banner updated successfully',
  })
  @ApiBadRequestResponse({
    description: 'The submitted banner information is invalid',
  })
  @ApiNotFoundResponse({
    description: 'Banner was not found',
  })
  async update(
    @Param('id', ParseUUIDPipe)
    id: string,

    @Body()
    updateDto: UpdateBannerDto,
  ) {
    const banner = await this.bannersService.update(id, updateDto);

    return {
      success: true,
      message: 'Banner updated successfully',
      data: {
        banner,
      },
    };
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a banner',
  })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'Banner deleted successfully',
  })
  @ApiNotFoundResponse({
    description: 'Banner was not found',
  })
  async remove(
    @Param('id', ParseUUIDPipe)
    id: string,
  ) {
    const banner = await this.bannersService.remove(id);

    return {
      success: true,
      message: 'Banner deleted successfully',
      data: {
        banner,
      },
    };
  }
}
