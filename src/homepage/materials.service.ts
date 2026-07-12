import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateMaterialsDto } from './dto/update-materials.dto';

const MATERIALS_SECTION_KEY = 'wood-types';

@Injectable()
export class MaterialsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSection() {
    const section = await this.prisma.homepageSection.findUnique({
      where: {
        sectionKey: MATERIALS_SECTION_KEY,
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
        'The Materials We Work With section was not found',
      );
    }

    const materials = [0, 1, 2].map((index) => {
      const item = section.items[index];
      const image = section.images[index];

      return {
        name: item?.title ?? '',
        description: item?.description ?? '',
        imageUrl: image?.imageUrl ?? '',
        imagePublicId: image?.imagePublicId ?? '',
        altText: image?.altText ?? '',
        displayOrder: index,
      };
    });

    return {
      id: section.id,
      sectionKey: section.sectionKey,
      sectionType: section.sectionType,
      title: section.title,
      displayOrder: section.displayOrder,
      isActive: section.isActive,
      updatedAt: section.updatedAt,
      materials,
    };
  }

  async updateSection(updateDto: UpdateMaterialsDto) {
    const existingSection = await this.prisma.homepageSection.findUnique({
      where: {
        sectionKey: MATERIALS_SECTION_KEY,
      },
      select: {
        id: true,
      },
    });

    if (!existingSection) {
      throw new NotFoundException(
        'The Materials We Work With section was not found',
      );
    }

    await this.prisma.$transaction(async (transaction) => {
      await transaction.homepageSection.update({
        where: {
          id: existingSection.id,
        },
        data: {
          title: updateDto.title.trim(),

          sectionKey: MATERIALS_SECTION_KEY,

          sectionType: 'product-grid',

          displayOrder: 1,

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
        data: updateDto.materials.map((material, index) => ({
          sectionId: existingSection.id,
          title: material.name.trim(),
          description: material.description.trim(),
          displayOrder: index,
          isActive: true,
        })),
      });

      await transaction.homepageSectionImage.createMany({
        data: updateDto.materials.map((material, index) => ({
          sectionId: existingSection.id,
          imageUrl: material.imageUrl.trim(),
          imagePublicId: material.imagePublicId.trim(),
          altText: material.altText.trim(),

          caption: material.name.trim(),

          displayOrder: index,

          isPrimary: index === 0,

          isActive: true,
        })),
      });
    });

    return this.getSection();
  }
}
