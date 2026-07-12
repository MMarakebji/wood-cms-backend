import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePriceListDto } from './dto/create-price-list.dto';
import { ReorderPriceListsDto } from './dto/reorder-price-lists.dto';
import { UpdatePriceListDto } from './dto/update-price-list.dto';

@Injectable()
export class PriceListsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.priceList.findMany({
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
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

  async findOne(id: string) {
    const priceList = await this.prisma.priceList.findUnique({
      where: {
        id,
      },

      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!priceList) {
      throw new NotFoundException('Price-list row was not found');
    }

    return priceList;
  }

  async create(createDto: CreatePriceListDto) {
    if (createDto.productId) {
      await this.ensureProductExists(createDto.productId);
    }

    const lastPriceList = await this.prisma.priceList.findFirst({
      orderBy: {
        displayOrder: 'desc',
      },

      select: {
        displayOrder: true,
      },
    });

    const displayOrder =
      createDto.displayOrder ?? (lastPriceList?.displayOrder ?? 0) + 1;

    return this.prisma.priceList.create({
      data: {
        productId: createDto.productId ?? null,

        listName: createDto.listName,

        itemName: createDto.itemName ?? null,

        lengthMm: createDto.lengthMm ?? null,

        widthMm: createDto.widthMm ?? null,

        thicknessMm: createDto.thicknessMm ?? null,

        volumeM3: createDto.volumeM3 ?? null,

        pricePerM3: createDto.pricePerM3 ?? null,

        pricePerPiece: createDto.pricePerPiece ?? null,

        currency: createDto.currency ?? 'CZK',

        displayOrder,

        isActive: createDto.isActive ?? true,
      },

      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
  }

  async update(id: string, updateDto: UpdatePriceListDto) {
    await this.findOne(id);

    if (updateDto.productId !== undefined && updateDto.productId !== null) {
      await this.ensureProductExists(updateDto.productId);
    }

    return this.prisma.priceList.update({
      where: {
        id,
      },

      data: {
        ...(updateDto.productId !== undefined
          ? {
              productId: updateDto.productId,
            }
          : {}),

        ...(updateDto.listName !== undefined
          ? {
              listName: updateDto.listName,
            }
          : {}),

        ...(updateDto.itemName !== undefined
          ? {
              itemName: updateDto.itemName,
            }
          : {}),

        ...(updateDto.lengthMm !== undefined
          ? {
              lengthMm: updateDto.lengthMm,
            }
          : {}),

        ...(updateDto.widthMm !== undefined
          ? {
              widthMm: updateDto.widthMm,
            }
          : {}),

        ...(updateDto.thicknessMm !== undefined
          ? {
              thicknessMm: updateDto.thicknessMm,
            }
          : {}),

        ...(updateDto.volumeM3 !== undefined
          ? {
              volumeM3: updateDto.volumeM3,
            }
          : {}),

        ...(updateDto.pricePerM3 !== undefined
          ? {
              pricePerM3: updateDto.pricePerM3,
            }
          : {}),

        ...(updateDto.pricePerPiece !== undefined
          ? {
              pricePerPiece: updateDto.pricePerPiece,
            }
          : {}),

        ...(updateDto.currency !== undefined
          ? {
              currency: updateDto.currency,
            }
          : {}),

        ...(updateDto.displayOrder !== undefined
          ? {
              displayOrder: updateDto.displayOrder,
            }
          : {}),

        ...(updateDto.isActive !== undefined
          ? {
              isActive: updateDto.isActive,
            }
          : {}),
      },

      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    const existingPriceList = await this.findOne(id);

    await this.prisma.$transaction(async (transaction) => {
      await transaction.priceList.delete({
        where: {
          id,
        },
      });

      const remainingPriceLists = await transaction.priceList.findMany({
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

      for (let index = 0; index < remainingPriceLists.length; index += 1) {
        const priceList = remainingPriceLists[index];

        if (!priceList) {
          continue;
        }

        await transaction.priceList.update({
          where: {
            id: priceList.id,
          },

          data: {
            displayOrder: index + 1,
          },
        });
      }
    });

    return existingPriceList;
  }

  async reorder(reorderDto: ReorderPriceListsDto) {
    const existingPriceLists = await this.prisma.priceList.findMany({
      select: {
        id: true,
      },
    });

    if (reorderDto.priceListIds.length !== existingPriceLists.length) {
      throw new BadRequestException(
        'The reorder request must contain every price-list row exactly once',
      );
    }

    const existingIds = new Set(
      existingPriceLists.map((priceList) => priceList.id),
    );

    const containsUnknownId = reorderDto.priceListIds.some(
      (priceListId) => !existingIds.has(priceListId),
    );

    if (containsUnknownId) {
      throw new BadRequestException(
        'The reorder request contains an unknown price-list row',
      );
    }

    await this.prisma.$transaction(
      reorderDto.priceListIds.map((priceListId, index) =>
        this.prisma.priceList.update({
          where: {
            id: priceListId,
          },

          data: {
            displayOrder: index + 1,
          },
        }),
      ),
    );

    return this.findAll();
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
      throw new NotFoundException('The selected product was not found');
    }
  }
}
