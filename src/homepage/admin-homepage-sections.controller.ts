import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateHomepageSectionDto } from './dto/update-homepage-section.dto';
import { HomepageSectionsService } from './homepage-sections.service';
import {
  isHomepageSectionKey,
  type HomepageSectionKey,
} from './types/homepage-section-key.type';

@ApiTags('Admin Homepage Sections')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('admin/homepage/sections')
export class AdminHomepageSectionsController {
  constructor(private readonly sectionsService: HomepageSectionsService) {}

  @Get()
  @ApiOperation({
    summary: 'Retrieve the six fixed homepage sections',
  })
  @ApiOkResponse({
    description: 'Fixed homepage sections retrieved successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Administrator authentication is required',
  })
  async getSections() {
    const sections = await this.sectionsService.getAdminSections();

    return {
      success: true,
      message: 'Homepage sections retrieved successfully',
      data: {
        sections,
      },
    };
  }

  @Get(':sectionKey')
  @ApiOperation({
    summary: 'Retrieve one fixed homepage section',
  })
  @ApiOkResponse({
    description: 'Homepage section retrieved successfully',
  })
  @ApiBadRequestResponse({
    description: 'The supplied section key is not supported',
  })
  @ApiNotFoundResponse({
    description: 'Homepage section was not found',
  })
  async getSection(@Param('sectionKey') sectionKeyValue: string) {
    const sectionKey = this.validateSectionKey(sectionKeyValue);

    const section = await this.sectionsService.getSectionByKey(sectionKey);

    return {
      success: true,
      message: 'Homepage section retrieved successfully',
      data: {
        section,
      },
    };
  }

  @Patch(':sectionKey')
  @ApiOperation({
    summary: 'Update one fixed homepage section',
  })
  @ApiOkResponse({
    description: 'Homepage section updated successfully',
  })
  @ApiBadRequestResponse({
    description: 'The supplied section key or request data is invalid',
  })
  @ApiNotFoundResponse({
    description: 'Homepage section was not found',
  })
  async updateSection(
    @Param('sectionKey') sectionKeyValue: string,
    @Body()
    updateDto: UpdateHomepageSectionDto,
  ) {
    const sectionKey = this.validateSectionKey(sectionKeyValue);

    const section = await this.sectionsService.updateSection(
      sectionKey,
      updateDto,
    );

    return {
      success: true,
      message: 'Homepage section updated successfully',
      data: {
        section,
      },
    };
  }

  private validateSectionKey(value: string): HomepageSectionKey {
    if (!isHomepageSectionKey(value)) {
      throw new BadRequestException('Unsupported homepage section key');
    }

    return value;
  }
}
