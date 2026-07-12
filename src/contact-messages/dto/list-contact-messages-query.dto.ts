import { Transform, Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export const CONTACT_MESSAGE_STATUSES = ['NEW', 'READ', 'ARCHIVED'] as const;

export type ContactMessageStatus = (typeof CONTACT_MESSAGE_STATUSES)[number];

function trimString({ value }: { value: unknown }): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

function normalizeStatus({ value }: { value: unknown }): unknown {
  return typeof value === 'string' ? value.trim().toUpperCase() : value;
}

export class ListContactMessagesQueryDto {
  @IsOptional()
  @Transform(normalizeStatus)
  @IsIn(CONTACT_MESSAGE_STATUSES)
  status?: ContactMessageStatus;

  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(150)
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10;
}
