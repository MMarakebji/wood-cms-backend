import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateAboutUsDto } from './dto/update-about-us.dto';

const ABOUT_US_SECTION_KEY = 'about';

@Injectable()
export class AboutUsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSection() {
    const section = await this.prisma.homepageSection.findUnique({
      where: {
        sectionKey: ABOUT_US_SECTION_KEY,
      },
      include: {
        images: {
          orderBy: {
            displayOrder: 'asc',
          },
        },
      },
    });

    if (!section) {
      throw new NotFoundException('The About Us section was not found');
    }

    return section;
  }

  async updateSection(updateDto: UpdateAboutUsDto) {
    const existingSection = await this.prisma.homepageSection.findUnique({
      where: {
        sectionKey: ABOUT_US_SECTION_KEY,
      },
      select: {
        id: true,
      },
    });

    if (!existingSection) {
      throw new NotFoundException('The About Us section was not found');
    }

    await this.prisma.$transaction(async (transaction) => {
      await transaction.homepageSection.update({
        where: {
          id: existingSection.id,
        },
        data: {
          title: updateDto.title.trim(),
          body: updateDto.description.trim(),
          isActive: true,
        },
      });

      /*
       * Replace the previous three image records
       * with the three submitted image records.
       */
      await transaction.homepageSectionImage.deleteMany({
        where: {
          sectionId: existingSection.id,
        },
      });

      await transaction.homepageSectionImage.createMany({
        data: updateDto.images.map((image, index) => ({
          sectionId: existingSection.id,
          imageUrl: image.imageUrl.trim(),
          imagePublicId: image.imagePublicId.trim(),
          altText: image.altText.trim(),
          caption: null,
          displayOrder: index,
          isPrimary: index === 0,
          isActive: true,
        })),
      });
    });

    return this.getSection();
  }
}
