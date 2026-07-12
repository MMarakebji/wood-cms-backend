import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { HomepageSectionsService } from './homepage-sections.service';

@ApiTags('Public Homepage')
@Controller('homepage/sections')
export class HomepageSectionsController {
  constructor(private readonly sectionsService: HomepageSectionsService) {}

  @Get()
  @ApiOperation({
    summary: 'Retrieve active homepage sections',
  })
  @ApiOkResponse({
    description: 'Active homepage sections retrieved successfully',
  })
  async getPublicSections() {
    const sections = await this.sectionsService.getPublicSections();

    return {
      success: true,
      message: 'Homepage sections retrieved successfully',
      data: {
        sections,
      },
    };
  }
}
