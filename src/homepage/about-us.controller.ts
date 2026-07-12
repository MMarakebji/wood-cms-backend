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
import { AboutUsService } from './about-us.service';
import { UpdateAboutUsDto } from './dto/update-about-us.dto';

@ApiTags('Admin — About Us')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('admin/homepage/about-us')
export class AboutUsController {
  constructor(private readonly aboutUsService: AboutUsService) {}

  @Get()
  @ApiOperation({
    summary: 'Retrieve the About Us section for editing',
  })
  @ApiOkResponse({
    description: 'About Us section retrieved successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Administrator authentication is required',
  })
  @ApiNotFoundResponse({
    description: 'About Us section was not found',
  })
  async getSection() {
    const section = await this.aboutUsService.getSection();

    return {
      success: true,
      message: 'About Us section retrieved successfully',
      data: {
        section,
      },
    };
  }

  @Patch()
  @ApiOperation({
    summary: 'Update the About Us title, description, and three images',
  })
  @ApiOkResponse({
    description: 'About Us section updated successfully',
  })
  @ApiBadRequestResponse({
    description: 'The request must contain valid text and exactly three images',
  })
  @ApiUnauthorizedResponse({
    description: 'Administrator authentication is required',
  })
  @ApiNotFoundResponse({
    description: 'About Us section was not found',
  })
  async updateSection(
    @Body()
    updateDto: UpdateAboutUsDto,
  ) {
    const section = await this.aboutUsService.updateSection(updateDto);

    return {
      success: true,
      message: 'About Us section updated successfully',
      data: {
        section,
      },
    };
  }
}
