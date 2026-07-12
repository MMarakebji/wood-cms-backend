import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateProductFeatureDto,
  ProductFeatureType,
} from './dto/create-product-feature.dto';
import { ReorderProductFeaturesDto } from './dto/reorder-product-features.dto';
import { UpdateProductFeatureDto } from './dto/update-product-feature.dto';

@Injectable()
export class ProductFeaturesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(productId: string) {
    await this.ensureProductExists(productId);

    return this.prisma.productFeature.findMany({
      where: {
        productId,
      },

      orderBy: [
        {
          displayOrder: 'asc',
        },
        {
          createdAt: 'asc',
        },
      ],
    });
  }

  async findOne(productId: string, featureId: string) {
    const feature = await this.prisma.productFeature.findFirst({
      where: {
        id: featureId,
        productId,
      },
    });

    if (!feature) {
      throw new NotFoundException('Product feature was not found');
    }

    return feature;
  }

  async create(productId: string, createDto: CreateProductFeatureDto) {
    await this.ensureProductExists(productId);

    const lastFeature = await this.prisma.productFeature.findFirst({
      where: {
        productId,
      },

      orderBy: {
        displayOrder: 'desc',
      },

      select: {
        displayOrder: true,
      },
    });

    const displayOrder = (lastFeature?.displayOrder ?? 0) + 1;

    return this.prisma.productFeature.create({
      data: {
        productId,
        label: createDto.label,
        featureType: createDto.featureType ?? ProductFeatureType.BENEFIT,
        displayOrder,
      },
    });
  }

  async update(
    productId: string,
    featureId: string,
    updateDto: UpdateProductFeatureDto,
  ) {
    await this.findOne(productId, featureId);

    return this.prisma.productFeature.update({
      where: {
        id: featureId,
      },

      data: {
        ...(updateDto.label !== undefined
          ? {
              label: updateDto.label,
            }
          : {}),

        ...(updateDto.featureType !== undefined
          ? {
              featureType: updateDto.featureType,
            }
          : {}),
      },
    });
  }

  async remove(productId: string, featureId: string) {
    const existingFeature = await this.findOne(productId, featureId);

    await this.prisma.$transaction(async (transaction) => {
      await transaction.productFeature.delete({
        where: {
          id: featureId,
        },
      });

      const remainingFeatures = await transaction.productFeature.findMany({
        where: {
          productId,
        },

        orderBy: [
          {
            displayOrder: 'asc',
          },
          {
            createdAt: 'asc',
          },
        ],

        select: {
          id: true,
        },
      });

      for (let index = 0; index < remainingFeatures.length; index += 1) {
        const feature = remainingFeatures[index];

        if (!feature) {
          continue;
        }

        await transaction.productFeature.update({
          where: {
            id: feature.id,
          },

          data: {
            displayOrder: index + 1,
          },
        });
      }
    });

    return existingFeature;
  }

  async reorder(productId: string, reorderDto: ReorderProductFeaturesDto) {
    await this.ensureProductExists(productId);

    const existingFeatures = await this.prisma.productFeature.findMany({
      where: {
        productId,
      },

      select: {
        id: true,
      },
    });

    if (reorderDto.featureIds.length !== existingFeatures.length) {
      throw new BadRequestException(
        'The reorder request must contain every feature for this product exactly once',
      );
    }

    const existingFeatureIds = new Set(
      existingFeatures.map((feature) => feature.id),
    );

    const containsUnknownFeature = reorderDto.featureIds.some(
      (featureId) => !existingFeatureIds.has(featureId),
    );

    if (containsUnknownFeature) {
      throw new BadRequestException(
        'The reorder request contains a feature that does not belong to this product',
      );
    }

    await this.prisma.$transaction(
      reorderDto.featureIds.map((featureId, index) =>
        this.prisma.productFeature.update({
          where: {
            id: featureId,
          },

          data: {
            displayOrder: index + 1,
          },
        }),
      ),
    );

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
}
