import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateWorkStagesDto } from './dto/update-work-stages.dto';

const WORK_STAGES_SECTION_KEY = 'advantages';

@Injectable()
export class WorkStagesService {
  constructor(private readonly prisma: PrismaService) {}

  async getSection() {
    const section = await this.prisma.homepageSection.findUnique({
      where: {
        sectionKey: WORK_STAGES_SECTION_KEY,
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
        'The Stages of Working With Us section was not found',
      );
    }

    const image = section.images[0];

    return {
      id: section.id,
      sectionKey: section.sectionKey,
      sectionType: section.sectionType,
      title: section.title,
      buttonText: section.buttonText,
      buttonLink: section.buttonLink,
      displayOrder: section.displayOrder,
      isActive: section.isActive,
      updatedAt: section.updatedAt,

      image: {
        imageUrl: image?.imageUrl ?? '',
        imagePublicId: image?.imagePublicId ?? '',
        altText: image?.altText ?? '',
      },

      stages: [0, 1, 2].map((index) => ({
        description: section.items[index]?.description ?? '',
        displayOrder: index,
      })),
    };
  }

  async updateSection(updateDto: UpdateWorkStagesDto) {
    const existingSection = await this.prisma.homepageSection.findUnique({
      where: {
        sectionKey: WORK_STAGES_SECTION_KEY,
      },
      select: {
        id: true,
      },
    });

    if (!existingSection) {
      throw new NotFoundException(
        'The Stages of Working With Us section was not found',
      );
    }

    await this.prisma.$transaction(async (transaction) => {
      await transaction.homepageSection.update({
        where: {
          id: existingSection.id,
        },
        data: {
          title: updateDto.title.trim(),
          buttonText: updateDto.buttonText.trim(),
          buttonLink: updateDto.buttonLink.trim(),

          sectionType: 'list',
          displayOrder: 3,
          isActive: true,
        },
      });

      await transaction.homepageSectionItem.deleteMany({
        where: {
          sectionId: existingSection.id,
        },
      });

      await transaction.homepageSectionImage.deleteMany({
        where: {
          sectionId: existingSection.id,
        },
      });

      await transaction.homepageSectionItem.createMany({
        data: updateDto.stages.map((stage, index) => ({
          sectionId: existingSection.id,
          title: null,
          description: stage.description.trim(),
          iconName: null,
          displayOrder: index,
          isActive: true,
        })),
      });

      await transaction.homepageSectionImage.create({
        data: {
          sectionId: existingSection.id,
          imageUrl: updateDto.image.imageUrl.trim(),
          imagePublicId: updateDto.image.imagePublicId.trim(),
          altText: updateDto.image.altText.trim(),
          caption: null,
          displayOrder: 0,
          isPrimary: true,
          isActive: true,
        },
      });
    });

    return this.getSection();
  }
}
