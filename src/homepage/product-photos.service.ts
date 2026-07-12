import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProductPhotosDto } from './dto/update-product-photos.dto';

const PRODUCT_PHOTOS_SECTION_KEY = 'our-work';

@Injectable()
export class ProductPhotosService {
  constructor(private readonly prisma: PrismaService) {}

  async getSection() {
    const section = await this.prisma.homepageSection.findUnique({
      where: {
        sectionKey: PRODUCT_PHOTOS_SECTION_KEY,
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
      throw new NotFoundException('The Product Photos section was not found');
    }

    return section;
  }

  async updateSection(updateDto: UpdateProductPhotosDto) {
    const existingSection = await this.prisma.homepageSection.findUnique({
      where: {
        sectionKey: PRODUCT_PHOTOS_SECTION_KEY,
      },
      include: {
        images: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!existingSection) {
      throw new NotFoundException('The Product Photos section was not found');
    }

    const existingImageIds = new Set(
      existingSection.images.map((image) => image.id),
    );

    const submittedExistingIds = updateDto.images
      .map((image) => image.id)
      .filter((id): id is string => id !== undefined);

    const uniqueSubmittedIds = new Set(submittedExistingIds);

    if (uniqueSubmittedIds.size !== submittedExistingIds.length) {
      throw new BadRequestException('The request contains duplicate image IDs');
    }

    const containsUnknownImage = submittedExistingIds.some(
      (id) => !existingImageIds.has(id),
    );

    if (containsUnknownImage) {
      throw new BadRequestException(
        'One or more images do not belong to the Product Photos section',
      );
    }

    await this.prisma.$transaction(async (transaction) => {
      await transaction.homepageSection.update({
        where: {
          id: existingSection.id,
        },
        data: {
          title: updateDto.title.trim(),

          sectionKey: PRODUCT_PHOTOS_SECTION_KEY,

          sectionType: 'gallery',

          displayOrder: 2,

          isActive: true,
        },
      });

      /*
       * Clear the primary flag before assigning
       * the first submitted photo as primary.
       */
      await transaction.homepageSectionImage.updateMany({
        where: {
          sectionId: existingSection.id,
        },
        data: {
          isPrimary: false,
        },
      });

      /*
       * Delete images that the administrator
       * removed from the submitted gallery.
       */
      await transaction.homepageSectionImage.deleteMany({
        where: {
          sectionId: existingSection.id,

          ...(submittedExistingIds.length > 0
            ? {
                id: {
                  notIn: submittedExistingIds,
                },
              }
            : {}),
        },
      });

      for (let index = 0; index < updateDto.images.length; index += 1) {
        const image = updateDto.images[index];

        if (!image) {
          continue;
        }

        const imageData = {
          imageUrl: image.imageUrl.trim(),

          imagePublicId: image.imagePublicId.trim(),

          altText: image.altText.trim(),

          caption: image.caption?.trim() || null,

          displayOrder: index,

          isPrimary: index === 0,

          isActive: true,
        };

        if (image.id) {
          await transaction.homepageSectionImage.update({
            where: {
              id: image.id,
            },
            data: imageData,
          });

          continue;
        }

        await transaction.homepageSectionImage.create({
          data: {
            sectionId: existingSection.id,
            ...imageData,
          },
        });
      }
    });

    return this.getSection();
  }
}
