import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateHomepageSettingsDto } from './dto/update-homepage-settings.dto';

const HOMEPAGE_SETTINGS_ID = 1;

@Injectable()
export class HomepageService {
  constructor(private readonly prisma: PrismaService) {}

  async getPublicSettings() {
    const settings = await this.prisma.homepageSetting.findUnique({
      where: {
        id: HOMEPAGE_SETTINGS_ID,
      },
      select: {
        id: true,
        companyName: true,
        logoUrl: true,
        logoAltText: true,
        phone: true,
        email: true,
        addressLine1: true,
        addressLine2: true,
        privacyPolicyText: true,
        privacyPolicyUrl: true,
        footerText: true,
        updatedAt: true,
      },
    });

    if (!settings) {
      throw new NotFoundException('Homepage settings have not been configured');
    }

    return settings;
  }

  async getAdminSettings() {
    const settings = await this.prisma.homepageSetting.findUnique({
      where: {
        id: HOMEPAGE_SETTINGS_ID,
      },
    });

    if (!settings) {
      throw new NotFoundException('Homepage settings have not been configured');
    }

    return settings;
  }

  async updateSettings(updateDto: UpdateHomepageSettingsDto) {
    await this.getAdminSettings();

    return this.prisma.homepageSetting.update({
      where: {
        id: HOMEPAGE_SETTINGS_ID,
      },
      data: updateDto,
    });
  }
}
