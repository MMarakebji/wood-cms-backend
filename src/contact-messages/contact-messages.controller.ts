import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ContactMessagesService } from './contact-messages.service';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';

@ApiTags('Public — Contact Messages')
@Controller('contact-messages')
export class ContactMessagesController {
  constructor(
    private readonly contactMessagesService: ContactMessagesService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Submit a message from the public homepage contact form',
  })
  @ApiCreatedResponse({
    description: 'Contact message submitted successfully',
    schema: {
      example: {
        success: true,
        message: 'Your message was sent successfully.',
        data: {
          submission: {
            id: '550e8400-e29b-41d4-a716-446655440000',
            status: 'NEW',
            createdAt: '2026-07-12T10:30:00.000Z',
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'The name, phone number, or message is invalid',
  })
  async create(
    @Body()
    createDto: CreateContactMessageDto,
  ) {
    const submission = await this.contactMessagesService.create(createDto);

    return {
      success: true,
      message: 'Your message was sent successfully.',
      data: {
        submission,
      },
    };
  }
}
