import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateHomepageSettingsDto {
  @ApiPropertyOptional({
    example: 'Wood Products',
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(150)
  companyName?: string;

  @ApiPropertyOptional({
    example: 'https://res.cloudinary.com/example/image/upload/logo.png',
  })
  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @ApiPropertyOptional({
    example: 'wood-products/homepage/logo',
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  logoPublicId?: string;

  @ApiPropertyOptional({
    example: 'Wood Products company logo',
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  logoAltText?: string;

  @ApiPropertyOptional({
    example: '+961 1 234 567',
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(40)
  phone?: string;

  @ApiPropertyOptional({
    example: 'info@woodproducts.com',
    nullable: true,
  })
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string | null;

  @ApiPropertyOptional({
    example: 'Main Street, Beirut',
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  addressLine1?: string;

  @ApiPropertyOptional({
    example: 'Lebanon',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  addressLine2?: string | null;

  @ApiPropertyOptional({
    example: 'Privacy Policy',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  privacyPolicyText?: string | null;

  @ApiPropertyOptional({
    example: '/privacy-policy',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  privacyPolicyUrl?: string | null;

  @ApiPropertyOptional({
    example: '© 2026 Wood Products. All rights reserved.',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  footerText?: string | null;
}
