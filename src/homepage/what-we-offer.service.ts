import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateWhatWeOfferDto } from './dto/update-what-we-offer.dto';

const WHAT_WE_OFFER_SECTION_KEY = 'hero';

@Injectable()
export class WhatWeOfferService {
  constructor(private readonly prisma: PrismaService) {}

  async getSection() {
    const section = await this.prisma.homepageSection.findUnique({
      where: {
        sectionKey: WHAT_WE_OFFER_SECTION_KEY,
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
      throw new NotFoundException('The What We Offer section was not found');
    }

    return section;
  }

  async updateSection(updateDto: UpdateWhatWeOfferDto) {
    const existingSection = await this.prisma.homepageSection.findUnique({
      where: {
        sectionKey: WHAT_WE_OFFER_SECTION_KEY,
      },
      select: {
        id: true,
      },
    });

    if (!existingSection) {
      throw new NotFoundException('The What We Offer section was not found');
    }

    await this.prisma.$transaction(async (transaction) => {
      await transaction.homepageSection.update({
        where: {
          id: existingSection.id,
        },
        data: {
          title: updateDto.title.trim(),
          body: updateDto.description.trim(),
          buttonText: updateDto.buttonText.trim(),
          buttonLink: updateDto.buttonLink.trim(),

          // These values remain controlled by the app.
          sectionKey: WHAT_WE_OFFER_SECTION_KEY,
          sectionType: 'hero',
          displayOrder: 0,
          isActive: true,
        },
      });

      /*
       * The section must contain exactly three
       * image records.
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
