import { Controller, Get } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { HomepageService } from './homepage.service';

@ApiTags('Public Homepage')
@Controller('homepage')
export class HomepageController {
  constructor(private readonly homepageService: HomepageService) {}

  @Get('settings')
  @ApiOperation({
    summary: 'Retrieve public homepage settings',
  })
  @ApiOkResponse({
    description: 'Public homepage settings retrieved successfully',
  })
  @ApiNotFoundResponse({
    description: 'Homepage settings have not been configured',
  })
  async getPublicSettings() {
    const settings = await this.homepageService.getPublicSettings();

    return {
      success: true,
      message: 'Homepage settings retrieved successfully',
      data: {
        settings,
      },
    };
  }
}
