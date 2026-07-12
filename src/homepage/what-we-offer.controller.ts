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
import { UpdateWhatWeOfferDto } from './dto/update-what-we-offer.dto';
import { WhatWeOfferService } from './what-we-offer.service';

@ApiTags('Admin — What We Offer')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('admin/homepage/what-we-offer')
export class WhatWeOfferController {
  constructor(private readonly whatWeOfferService: WhatWeOfferService) {}

  @Get()
  @ApiOperation({
    summary: 'Retrieve the What We Offer section for editing',
  })
  @ApiOkResponse({
    description: 'What We Offer section retrieved successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Administrator authentication is required',
  })
  @ApiNotFoundResponse({
    description: 'What We Offer section was not found',
  })
  async getSection() {
    const section = await this.whatWeOfferService.getSection();

    return {
      success: true,
      message: 'What We Offer section retrieved successfully',
      data: {
        section,
      },
    };
  }

  @Patch()
  @ApiOperation({
    summary: 'Update the What We Offer section and its three images',
  })
  @ApiOkResponse({
    description: 'What We Offer section updated successfully',
  })
  @ApiBadRequestResponse({
    description:
      'The request data is invalid or does not contain exactly three images',
  })
  @ApiUnauthorizedResponse({
    description: 'Administrator authentication is required',
  })
  @ApiNotFoundResponse({
    description: 'What We Offer section was not found',
  })
  async updateSection(
    @Body()
    updateDto: UpdateWhatWeOfferDto,
  ) {
    const section = await this.whatWeOfferService.updateSection(updateDto);

    return {
      success: true,
      message: 'What We Offer section updated successfully',
      data: {
        section,
      },
    };
  }
}
