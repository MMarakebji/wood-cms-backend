import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateHomepageSectionDto {
  @ApiPropertyOptional({
    example: 'Solid Wood Products',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string | null;

  @ApiPropertyOptional({
    example: 'Oak, beech, ash from 1700 CZK per m3',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  subtitle?: string | null;

  @ApiPropertyOptional({
    example: 'We manufacture dependable solid wood products.',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  body?: string | null;

  @ApiPropertyOptional({
    example: 'Order',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  buttonText?: string | null;

  @ApiPropertyOptional({
    example: '#contact',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  buttonLink?: string | null;

  @ApiPropertyOptional({
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
