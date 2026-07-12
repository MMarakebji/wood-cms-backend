import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateHomepageSettingsDto } from './dto/update-homepage-settings.dto';
import { HomepageService } from './homepage.service';

@ApiTags('Admin Homepage')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('admin/homepage')
export class AdminHomepageController {
  constructor(private readonly homepageService: HomepageService) {}

  @Get('settings')
  @ApiOperation({
    summary: 'Retrieve homepage settings for the CMS',
  })
  @ApiOkResponse({
    description: 'Homepage settings retrieved successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'A valid administrator access token is required',
  })
  @ApiNotFoundResponse({
    description: 'Homepage settings have not been configured',
  })
  async getSettings() {
    const settings = await this.homepageService.getAdminSettings();

    return {
      success: true,
      message: 'Homepage settings retrieved successfully',
      data: {
        settings,
      },
    };
  }

  @Patch('settings')
  @ApiOperation({
    summary: 'Update the shared homepage settings',
  })
  @ApiOkResponse({
    description: 'Homepage settings updated successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'A valid administrator access token is required',
  })
  @ApiNotFoundResponse({
    description: 'Homepage settings have not been configured',
  })
  async updateSettings(
    @Body()
    updateDto: UpdateHomepageSettingsDto,
  ) {
    const settings = await this.homepageService.updateSettings(updateDto);

    return {
      success: true,
      message: 'Homepage settings updated successfully',
      data: {
        settings,
      },
    };
  }
}
