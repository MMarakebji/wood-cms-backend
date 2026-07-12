import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class ContactFieldSettingsDto {
  @ApiProperty({
    example: 'Your name',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  label!: string;

  @ApiProperty({
    example: 'Enter your full name',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  placeholder!: string;
}

export class UpdateContactFormDto {
  @ApiProperty({
    example: 'Contact Us',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  title!: string;

  @ApiProperty({
    example:
      'Send us your question and our team will contact you as soon as possible.',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  description!: string;

  @ApiProperty({
    type: ContactFieldSettingsDto,
  })
  @ValidateNested()
  @Type(() => ContactFieldSettingsDto)
  nameField!: ContactFieldSettingsDto;

  @ApiProperty({
    type: ContactFieldSettingsDto,
  })
  @ValidateNested()
  @Type(() => ContactFieldSettingsDto)
  phoneField!: ContactFieldSettingsDto;

  @ApiProperty({
    type: ContactFieldSettingsDto,
  })
  @ValidateNested()
  @Type(() => ContactFieldSettingsDto)
  questionField!: ContactFieldSettingsDto;

  @ApiProperty({
    example: 'Send Question',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  submitButtonText!: string;
}
