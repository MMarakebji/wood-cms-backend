import { Controller, Get } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ContactFormService } from './contact-form.service';

@ApiTags('Public — Homepage Contact Form')
@Controller('homepage/contact-form')
export class PublicContactFormController {
  constructor(private readonly contactFormService: ContactFormService) {}

  @Get()
  @ApiOperation({
    summary: 'Retrieve the public homepage Contact Form configuration',
  })
  @ApiOkResponse({
    description: 'Contact Form configuration retrieved successfully',
  })
  @ApiNotFoundResponse({
    description: 'The Contact Form section was not found',
  })
  async getContactForm() {
    const section = await this.contactFormService.getSection();

    return {
      success: true,
      message: 'Contact Form configuration retrieved successfully',
      data: {
        section,
      },
    };
  }
}
