import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ContactMessagesService } from './contact-messages.service';
import {
  CONTACT_MESSAGE_STATUSES,
  ListContactMessagesQueryDto,
} from './dto/list-contact-messages-query.dto';
import { UpdateContactMessageStatusDto } from './dto/update-contact-message-status.dto';

@ApiTags('Admin — Contact Messages')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('admin/contact-messages')
export class AdminContactMessagesController {
  constructor(
    private readonly contactMessagesService: ContactMessagesService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'List contact messages with filters and pagination',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: CONTACT_MESSAGE_STATUSES,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 10,
  })
  @ApiOkResponse({
    description: 'Contact messages retrieved successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Administrator authentication is required',
  })
  async findAll(
    @Query()
    queryDto: ListContactMessagesQueryDto,
  ) {
    const result = await this.contactMessagesService.findAll(queryDto);

    return {
      success: true,
      message: 'Contact messages retrieved successfully',
      data: result,
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Retrieve one contact message',
  })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'Contact message retrieved successfully',
  })
  @ApiNotFoundResponse({
    description: 'Contact message was not found',
  })
  @ApiUnauthorizedResponse({
    description: 'Administrator authentication is required',
  })
  async findOne(
    @Param('id', ParseUUIDPipe)
    id: string,
  ) {
    const contactMessage = await this.contactMessagesService.findOne(id);

    return {
      success: true,
      message: 'Contact message retrieved successfully',
      data: {
        contactMessage,
      },
    };
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Mark a contact message as new, read, or archived',
  })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'Contact message status updated successfully',
  })
  @ApiBadRequestResponse({
    description: 'The contact message status is invalid',
  })
  @ApiNotFoundResponse({
    description: 'Contact message was not found',
  })
  @ApiUnauthorizedResponse({
    description: 'Administrator authentication is required',
  })
  async updateStatus(
    @Param('id', ParseUUIDPipe)
    id: string,

    @Body()
    updateDto: UpdateContactMessageStatusDto,
  ) {
    const contactMessage = await this.contactMessagesService.updateStatus(
      id,
      updateDto,
    );

    return {
      success: true,
      message: 'Contact message status updated successfully',
      data: {
        contactMessage,
      },
    };
  }
}
