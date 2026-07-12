import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn } from 'class-validator';
import {
  CONTACT_MESSAGE_STATUSES,
  type ContactMessageStatus,
} from './list-contact-messages-query.dto';

function normalizeStatus({ value }: { value: unknown }): unknown {
  return typeof value === 'string' ? value.trim().toUpperCase() : value;
}

export class UpdateContactMessageStatusDto {
  @ApiProperty({
    example: 'READ',
    enum: CONTACT_MESSAGE_STATUSES,
  })
  @Transform(normalizeStatus)
  @IsIn(CONTACT_MESSAGE_STATUSES)
  status!: ContactMessageStatus;
}
