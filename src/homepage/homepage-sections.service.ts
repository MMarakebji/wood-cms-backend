import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateHomepageSectionDto } from './dto/update-homepage-section.dto';
import {
  FIXED_HOMEPAGE_SECTION_KEYS,
  type HomepageSectionKey,
} from './types/homepage-section-key.type';

@Injectable()
export class HomepageSectionsService {
  constructor(private readonly prisma: PrismaService) {}

  getPublicSections() {
    return this.prisma.homepageSection.findMany({
      where: {
        sectionKey: {
          in: [...FIXED_HOMEPAGE_SECTION_KEYS],
        },
        isActive: true,
      },
      orderBy: {
        displayOrder: 'asc',
      },
      include: {
        images: {
          where: {
            isActive: true,
          },
          orderBy: {
            displayOrder: 'asc',
          },
          select: {
            id: true,
            imageUrl: true,
            altText: true,
            caption: true,
            displayOrder: true,
            isPrimary: true,
          },
        },
        items: {
          where: {
            isActive: true,
          },
          orderBy: {
            displayOrder: 'asc',
          },
          select: {
            id: true,
            title: true,
            description: true,
            iconName: true,
            displayOrder: true,
          },
        },
      },
    });
  }

  getAdminSections() {
    return this.prisma.homepageSection.findMany({
      where: {
        sectionKey: {
          in: [...FIXED_HOMEPAGE_SECTION_KEYS],
        },
      },
      orderBy: {
        displayOrder: 'asc',
      },
      include: {
        images: {
          orderBy: {
            displayOrder: 'asc',
          },
        },
        items: {
          orderBy: {
            displayOrder: 'asc',
          },
        },
      },
    });
  }

  async getSectionByKey(sectionKey: HomepageSectionKey) {
    const section = await this.prisma.homepageSection.findUnique({
      where: {
        sectionKey,
      },
      include: {
        images: {
          orderBy: {
            displayOrder: 'asc',
          },
        },
        items: {
          orderBy: {
            displayOrder: 'asc',
          },
        },
      },
    });

    if (!section) {
      throw new NotFoundException(
        `The "${sectionKey}" homepage section was not found`,
      );
    }

    return section;
  }

  async updateSection(
    sectionKey: HomepageSectionKey,
    updateDto: UpdateHomepageSectionDto,
  ) {
    await this.getSectionByKey(sectionKey);

    await this.prisma.homepageSection.update({
      where: {
        sectionKey,
      },
      data: {
        title: this.normalizeNullableText(updateDto.title),

        subtitle: this.normalizeNullableText(updateDto.subtitle),

        body: this.normalizeNullableText(updateDto.body),

        buttonText: this.normalizeNullableText(updateDto.buttonText),

        buttonLink: this.normalizeNullableText(updateDto.buttonLink),

        isActive: updateDto.isActive,
      },
    });

    return this.getSectionByKey(sectionKey);
  }

  private normalizeNullableText(
    value: string | null | undefined,
  ): string | null | undefined {
    if (value === undefined) {
      return undefined;
    }

    if (value === null) {
      return null;
    }

    const trimmedValue = value.trim();

    return trimmedValue.length > 0 ? trimmedValue : null;
  }
}
