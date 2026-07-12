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
import { ContactFormService } from './contact-form.service';
import { UpdateContactFormDto } from './dto/update-contact-form.dto';

@ApiTags('Admin — Contact Form')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('admin/homepage/contact-form')
export class ContactFormController {
  constructor(private readonly contactFormService: ContactFormService) {}

  @Get()
  @ApiOperation({
    summary: 'Retrieve the fixed Contact Form configuration',
  })
  @ApiOkResponse({
    description: 'Contact Form configuration retrieved successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Administrator authentication is required',
  })
  @ApiNotFoundResponse({
    description: 'Contact Form section was not found',
  })
  async getSection() {
    const section = await this.contactFormService.getSection();

    return {
      success: true,
      message: 'Contact Form configuration retrieved successfully',
      data: {
        section,
      },
    };
  }

  @Patch()
  @ApiOperation({
    summary:
      'Update the Contact Form title, description, labels, placeholders, and button',
  })
  @ApiOkResponse({
    description: 'Contact Form configuration updated successfully',
  })
  @ApiBadRequestResponse({
    description: 'The submitted Contact Form configuration is invalid',
  })
  @ApiUnauthorizedResponse({
    description: 'Administrator authentication is required',
  })
  @ApiNotFoundResponse({
    description: 'Contact Form section was not found',
  })
  async updateSection(
    @Body()
    updateDto: UpdateContactFormDto,
  ) {
    const section = await this.contactFormService.updateSection(updateDto);

    return {
      success: true,
      message: 'Contact Form configuration updated successfully',
      data: {
        section,
      },
    };
  }
}
