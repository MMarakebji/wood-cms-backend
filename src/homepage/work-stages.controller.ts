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
import { UpdateWorkStagesDto } from './dto/update-work-stages.dto';
import { WorkStagesService } from './work-stages.service';

@ApiTags('Admin — Stages of Working With Us')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('admin/homepage/work-stages')
export class WorkStagesController {
  constructor(private readonly workStagesService: WorkStagesService) {}

  @Get()
  @ApiOperation({
    summary: 'Retrieve the Stages of Working With Us section',
  })
  @ApiOkResponse({
    description: 'Work Stages section retrieved successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Administrator authentication is required',
  })
  @ApiNotFoundResponse({
    description: 'Work Stages section was not found',
  })
  async getSection() {
    const section = await this.workStagesService.getSection();

    return {
      success: true,
      message: 'Work Stages section retrieved successfully',
      data: {
        section,
      },
    };
  }

  @Patch()
  @ApiOperation({
    summary: 'Update the Work Stages title, image, descriptions, and button',
  })
  @ApiOkResponse({
    description: 'Work Stages section updated successfully',
  })
  @ApiBadRequestResponse({
    description:
      'The request must contain one valid image and exactly three descriptions',
  })
  @ApiUnauthorizedResponse({
    description: 'Administrator authentication is required',
  })
  @ApiNotFoundResponse({
    description: 'Work Stages section was not found',
  })
  async updateSection(
    @Body()
    updateDto: UpdateWorkStagesDto,
  ) {
    const section = await this.workStagesService.updateSection(updateDto);

    return {
      success: true,
      message: 'Work Stages section updated successfully',
      data: {
        section,
      },
    };
  }
}
