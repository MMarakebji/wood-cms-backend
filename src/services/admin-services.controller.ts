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
import { CreateServiceDto } from './dto/create-service.dto';
import { ReorderServicesDto } from './dto/reorder-services.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServicesService } from './services.service';

@ApiTags('Admin — Services')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('admin/services')
export class AdminServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  @ApiOperation({
    summary: 'Retrieve all services for administration',
  })
  @ApiOkResponse({
    description: 'Services retrieved successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Administrator authentication is required',
  })
  async findAll() {
    const services = await this.servicesService.findAll();

    return {
      success: true,
      message: 'Services retrieved successfully',
      data: {
        services,
      },
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Retrieve one service by ID',
  })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'Service retrieved successfully',
  })
  @ApiNotFoundResponse({
    description: 'Service was not found',
  })
  async findOne(
    @Param('id', ParseUUIDPipe)
    id: string,
  ) {
    const service = await this.servicesService.findOne(id);

    return {
      success: true,
      message: 'Service retrieved successfully',
      data: {
        service,
      },
    };
  }

  @Post()
  @ApiOperation({
    summary: 'Create a service',
  })
  @ApiCreatedResponse({
    description: 'Service created successfully',
  })
  @ApiBadRequestResponse({
    description: 'The submitted service information is invalid',
  })
  async create(
    @Body()
    createDto: CreateServiceDto,
  ) {
    const service = await this.servicesService.create(createDto);

    return {
      success: true,
      message: 'Service created successfully',
      data: {
        service,
      },
    };
  }

  /*
   * Keep this static route above PATCH :id.
   */
  @Patch('reorder')
  @ApiOperation({
    summary: 'Reorder all services',
  })
  @ApiOkResponse({
    description: 'Services reordered successfully',
  })
  @ApiBadRequestResponse({
    description: 'The service order is invalid',
  })
  async reorder(
    @Body()
    reorderDto: ReorderServicesDto,
  ) {
    const services = await this.servicesService.reorder(reorderDto);

    return {
      success: true,
      message: 'Services reordered successfully',
      data: {
        services,
      },
    };
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a service',
  })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'Service updated successfully',
  })
  @ApiBadRequestResponse({
    description: 'The submitted service information is invalid',
  })
  @ApiNotFoundResponse({
    description: 'Service was not found',
  })
  async update(
    @Param('id', ParseUUIDPipe)
    id: string,

    @Body()
    updateDto: UpdateServiceDto,
  ) {
    const service = await this.servicesService.update(id, updateDto);

    return {
      success: true,
      message: 'Service updated successfully',
      data: {
        service,
      },
    };
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a service',
  })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'Service deleted successfully',
  })
  @ApiNotFoundResponse({
    description: 'Service was not found',
  })
  async remove(
    @Param('id', ParseUUIDPipe)
    id: string,
  ) {
    const service = await this.servicesService.remove(id);

    return {
      success: true,
      message: 'Service deleted successfully',
      data: {
        service,
      },
    };
  }
}
