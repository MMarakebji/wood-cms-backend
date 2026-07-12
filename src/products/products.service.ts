import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { SupabaseStorageService } from '../media/supabase-storage.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ReorderProductsDto } from './dto/reorder-products.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  private readonly maximumPrice = new Prisma.Decimal('9999999999.99');

  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: SupabaseStorageService,
  ) {}

  async findAll() {
    return this.prisma.product.findMany({
      orderBy: [
        {
          displayOrder: 'asc',
        },
        {
          createdAt: 'asc',
        },
      ],

      include: {
        _count: {
          select: {
            features: true,
            images: true,
            priceLists: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: {
        id,
      },

      include: {
        features: {
          orderBy: {
            displayOrder: 'asc',
          },
        },

        images: {
          orderBy: {
            sortOrder: 'asc',
          },
        },

        priceLists: {
          orderBy: {
            displayOrder: 'asc',
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product was not found');
    }

    return product;
  }

  async create(createDto: CreateProductDto) {
    const slug = await this.generateUniqueSlug(
      createDto.slug ?? createDto.name,
    );

    let displayOrder = createDto.displayOrder;

    if (displayOrder === undefined) {
      const lastProduct = await this.prisma.product.findFirst({
        orderBy: {
          displayOrder: 'desc',
        },

        select: {
          displayOrder: true,
        },
      });

      displayOrder = (lastProduct?.displayOrder ?? 0) + 1;
    }

    const data: Prisma.ProductCreateInput = {
      name: createDto.name,
      slug,
      shortDescription: createDto.shortDescription ?? null,
      description: createDto.description ?? null,
      basePrice:
        createDto.basePrice === null || createDto.basePrice === undefined
          ? null
          : this.createDecimalPrice(createDto.basePrice),
      currency: createDto.currency ?? 'CZK',
      priceUnit: createDto.priceUnit ?? null,
      displayOrder,
      isActive: createDto.isActive ?? true,
    };

    return this.prisma.product.create({
      data,
    });
  }

  async update(id: string, updateDto: UpdateProductDto) {
    await this.findOne(id);

    const data: Prisma.ProductUpdateInput = {};

    if (updateDto.name !== undefined) {
      data.name = updateDto.name;
    }

    if (updateDto.slug !== undefined) {
      data.slug = await this.generateUniqueSlug(updateDto.slug, id);
    }

    if (updateDto.shortDescription !== undefined) {
      data.shortDescription = updateDto.shortDescription ?? null;
    }

    if (updateDto.description !== undefined) {
      data.description = updateDto.description ?? null;
    }

    if (updateDto.basePrice !== undefined) {
      data.basePrice =
        updateDto.basePrice === null
          ? null
          : this.createDecimalPrice(updateDto.basePrice);
    }

    if (updateDto.currency !== undefined) {
      data.currency = updateDto.currency;
    }

    if (updateDto.priceUnit !== undefined) {
      data.priceUnit = updateDto.priceUnit ?? null;
    }

    if (updateDto.displayOrder !== undefined) {
      data.displayOrder = updateDto.displayOrder;
    }

    if (updateDto.isActive !== undefined) {
      data.isActive = updateDto.isActive;
    }

    return this.prisma.product.update({
      where: {
        id,
      },

      data,
    });
  }

  async remove(id: string) {
    const existingProduct = await this.findOne(id);

    const imagePublicIds = existingProduct.images
      .map((image) => image.imagePublicId)
      .filter((imagePublicId) => imagePublicId.length > 0);

    await this.prisma.product.delete({
      where: {
        id,
      },
    });

    for (const imagePublicId of imagePublicIds) {
      await this.deleteStoredImageSafely(imagePublicId);
    }

    return existingProduct;
  }

  async reorder(reorderDto: ReorderProductsDto) {
    const existingProducts = await this.prisma.product.findMany({
      select: {
        id: true,
      },
    });

    if (reorderDto.productIds.length !== existingProducts.length) {
      throw new BadRequestException(
        'The reorder request must contain every product exactly once',
      );
    }

    const existingProductIds = new Set(
      existingProducts.map((product) => product.id),
    );

    const containsUnknownProduct = reorderDto.productIds.some(
      (productId) => !existingProductIds.has(productId),
    );

    if (containsUnknownProduct) {
      throw new BadRequestException(
        'The reorder request contains an unknown product ID',
      );
    }

    await this.prisma.$transaction(
      reorderDto.productIds.map((productId, index) =>
        this.prisma.product.update({
          where: {
            id: productId,
          },

          data: {
            displayOrder: index + 1,
          },
        }),
      ),
    );

    return this.findAll();
  }

  private createDecimalPrice(value: string): Prisma.Decimal {
    let decimalValue: Prisma.Decimal;

    try {
      decimalValue = new Prisma.Decimal(value);
    } catch {
      throw new BadRequestException('Base price is invalid');
    }

    if (decimalValue.isNegative()) {
      throw new BadRequestException('Base price cannot be negative');
    }

    if (decimalValue.greaterThan(this.maximumPrice)) {
      throw new BadRequestException(
        'Base price exceeds the maximum supported value',
      );
    }

    return decimalValue;
  }

  private async generateUniqueSlug(
    source: string,
    excludedProductId?: string,
  ): Promise<string> {
    const baseSlug = this.createSlug(source) || 'product';

    let candidateSlug = baseSlug;
    let suffix = 2;

    while (true) {
      const existingProduct = await this.prisma.product.findUnique({
        where: {
          slug: candidateSlug,
        },

        select: {
          id: true,
        },
      });

      if (!existingProduct || existingProduct.id === excludedProductId) {
        return candidateSlug;
      }

      candidateSlug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }
  }

  private createSlug(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 180);
  }

  private async deleteStoredImageSafely(imagePublicId: string): Promise<void> {
    try {
      await this.storageService.deleteImage(imagePublicId);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown storage error';

      this.logger.warn(
        `The product was deleted, but one stored image could not be removed: ${errorMessage}`,
      );
    }
  }
}
