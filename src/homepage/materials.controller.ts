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
import { UpdateMaterialsDto } from './dto/update-materials.dto';
import { MaterialsService } from './materials.service';

@ApiTags('Admin — Materials We Work With')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('admin/homepage/materials')
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  @Get()
  @ApiOperation({
    summary: 'Retrieve the Materials We Work With section',
  })
  @ApiOkResponse({
    description: 'Materials section retrieved successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Administrator authentication is required',
  })
  @ApiNotFoundResponse({
    description: 'Materials section was not found',
  })
  async getSection() {
    const section = await this.materialsService.getSection();

    return {
      success: true,
      message: 'Materials section retrieved successfully',
      data: {
        section,
      },
    };
  }

  @Patch()
  @ApiOperation({
    summary: 'Update the Materials section and its three material cards',
  })
  @ApiOkResponse({
    description: 'Materials section updated successfully',
  })
  @ApiBadRequestResponse({
    description: 'The request must contain exactly three valid materials',
  })
  @ApiUnauthorizedResponse({
    description: 'Administrator authentication is required',
  })
  @ApiNotFoundResponse({
    description: 'Materials section was not found',
  })
  async updateSection(
    @Body()
    updateDto: UpdateMaterialsDto,
  ) {
    const section = await this.materialsService.updateSection(updateDto);

    return {
      success: true,
      message: 'Materials section updated successfully',
      data: {
        section,
      },
    };
  }
}
