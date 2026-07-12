import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseStorageService } from '../media/supabase-storage.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductImageDto } from './dto/create-product-image.dto';
import { ReorderProductImagesDto } from './dto/reorder-product-images.dto';
import { UpdateProductImageDto } from './dto/update-product-image.dto';

@Injectable()
export class ProductImagesService {
  private readonly logger = new Logger(ProductImagesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: SupabaseStorageService,
  ) {}

  async findAll(productId: string) {
    await this.ensureProductExists(productId);

    return this.prisma.productImage.findMany({
      where: {
        productId,
      },

      orderBy: [
        {
          sortOrder: 'asc',
        },
        {
          createdAt: 'asc',
        },
      ],
    });
  }

  async findOne(productId: string, imageId: string) {
    const image = await this.prisma.productImage.findFirst({
      where: {
        id: imageId,
        productId,
      },
    });

    if (!image) {
      throw new NotFoundException('Product image was not found');
    }

    return image;
  }

  async create(productId: string, createDto: CreateProductImageDto) {
    await this.ensureProductExists(productId);

    return this.prisma.$transaction(async (transaction) => {
      const existingImages = await transaction.productImage.findMany({
        where: {
          productId,
        },

        orderBy: {
          sortOrder: 'desc',
        },

        select: {
          id: true,
          sortOrder: true,
        },
      });

      const lastImage = existingImages[0];

      const sortOrder = (lastImage?.sortOrder ?? 0) + 1;

      const shouldBePrimary =
        existingImages.length === 0 || createDto.isPrimary === true;

      if (shouldBePrimary) {
        await transaction.productImage.updateMany({
          where: {
            productId,
            isPrimary: true,
          },

          data: {
            isPrimary: false,
          },
        });
      }

      return transaction.productImage.create({
        data: {
          productId,
          imageUrl: createDto.imageUrl,
          imagePublicId: createDto.imagePublicId,
          altText: createDto.altText,
          sortOrder,
          isPrimary: shouldBePrimary,
        },
      });
    });
  }

  async update(
    productId: string,
    imageId: string,
    updateDto: UpdateProductImageDto,
  ) {
    await this.findOne(productId, imageId);

    return this.prisma.productImage.update({
      where: {
        id: imageId,
      },

      data: {
        altText: updateDto.altText,
      },
    });
  }

  async setPrimary(productId: string, imageId: string) {
    const existingImage = await this.findOne(productId, imageId);

    if (existingImage.isPrimary) {
      return existingImage;
    }

    return this.prisma.$transaction(async (transaction) => {
      await transaction.productImage.updateMany({
        where: {
          productId,
          isPrimary: true,
        },

        data: {
          isPrimary: false,
        },
      });

      return transaction.productImage.update({
        where: {
          id: imageId,
        },

        data: {
          isPrimary: true,
        },
      });
    });
  }

  async remove(productId: string, imageId: string) {
    const existingImage = await this.findOne(productId, imageId);

    await this.prisma.$transaction(async (transaction) => {
      await transaction.productImage.delete({
        where: {
          id: imageId,
        },
      });

      const remainingImages = await transaction.productImage.findMany({
        where: {
          productId,
        },

        orderBy: [
          {
            sortOrder: 'asc',
          },
          {
            createdAt: 'asc',
          },
        ],

        select: {
          id: true,
          sortOrder: true,
          isPrimary: true,
        },
      });

      if (remainingImages.length === 0) {
        return;
      }

      const primaryImageExists = remainingImages.some(
        (image) => image.isPrimary,
      );

      const firstRemainingImage = remainingImages[0];

      if (!primaryImageExists && firstRemainingImage) {
        await transaction.productImage.update({
          where: {
            id: firstRemainingImage.id,
          },

          data: {
            isPrimary: true,
          },
        });
      }

      const highestSortOrder = Math.max(
        ...remainingImages.map((image) => image.sortOrder),
      );

      const temporaryStart = highestSortOrder + remainingImages.length + 1000;

      /*
       * Move all images to temporary unique
       * positions first. This prevents conflicts
       * with the unique productId + sortOrder rule.
       */
      for (let index = 0; index < remainingImages.length; index += 1) {
        const image = remainingImages[index];

        if (!image) {
          continue;
        }

        await transaction.productImage.update({
          where: {
            id: image.id,
          },

          data: {
            sortOrder: temporaryStart + index,
          },
        });
      }

      /*
       * Assign the final continuous positions.
       */
      for (let index = 0; index < remainingImages.length; index += 1) {
        const image = remainingImages[index];

        if (!image) {
          continue;
        }

        await transaction.productImage.update({
          where: {
            id: image.id,
          },

          data: {
            sortOrder: index + 1,
          },
        });
      }
    });

    await this.deleteStoredImageSafely(existingImage.imagePublicId);

    return existingImage;
  }

  async reorder(productId: string, reorderDto: ReorderProductImagesDto) {
    await this.ensureProductExists(productId);

    const existingImages = await this.prisma.productImage.findMany({
      where: {
        productId,
      },

      select: {
        id: true,
        sortOrder: true,
      },
    });

    if (reorderDto.imageIds.length !== existingImages.length) {
      throw new BadRequestException(
        'The reorder request must contain every image for this product exactly once',
      );
    }

    const existingImageIds = new Set(existingImages.map((image) => image.id));

    const containsUnknownImage = reorderDto.imageIds.some(
      (imageId) => !existingImageIds.has(imageId),
    );

    if (containsUnknownImage) {
      throw new BadRequestException(
        'The reorder request contains an image that does not belong to this product',
      );
    }

    const highestSortOrder = Math.max(
      ...existingImages.map((image) => image.sortOrder),
    );

    const temporaryStart = highestSortOrder + existingImages.length + 1000;

    await this.prisma.$transaction(async (transaction) => {
      /*
       * Phase one: use temporary unique values.
       */
      for (let index = 0; index < reorderDto.imageIds.length; index += 1) {
        const imageId = reorderDto.imageIds[index];

        if (!imageId) {
          continue;
        }

        await transaction.productImage.update({
          where: {
            id: imageId,
          },

          data: {
            sortOrder: temporaryStart + index,
          },
        });
      }

      /*
       * Phase two: apply final positions.
       */
      for (let index = 0; index < reorderDto.imageIds.length; index += 1) {
        const imageId = reorderDto.imageIds[index];

        if (!imageId) {
          continue;
        }

        await transaction.productImage.update({
          where: {
            id: imageId,
          },

          data: {
            sortOrder: index + 1,
          },
        });
      }
    });

    return this.findAll(productId);
  }

  private async ensureProductExists(productId: string): Promise<void> {
    const product = await this.prisma.product.findUnique({
      where: {
        id: productId,
      },

      select: {
        id: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product was not found');
    }
  }

  private async deleteStoredImageSafely(imagePublicId: string): Promise<void> {
    try {
      await this.storageService.deleteImage(imagePublicId);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown storage error';

      this.logger.warn(
        `The product-image record was deleted, but the stored file could not be removed: ${errorMessage}`,
      );
    }
  }
}
