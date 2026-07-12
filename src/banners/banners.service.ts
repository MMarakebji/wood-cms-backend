import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { SupabaseStorageService } from '../media/supabase-storage.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { ReorderBannersDto } from './dto/reorder-banners.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';

@Injectable()
export class BannersService {
  private readonly logger = new Logger(BannersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: SupabaseStorageService,
  ) {}

  async findAll() {
    return this.prisma.banner.findMany({
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
    const banner = await this.prisma.banner.findUnique({
      where: {
        id,
      },
    });

    if (!banner) {
      throw new NotFoundException('Banner was not found');
    }

    return banner;
  }

  async create(createDto: CreateBannerDto) {
    let displayOrder = createDto.displayOrder;

    if (displayOrder === undefined) {
      const lastBanner = await this.prisma.banner.findFirst({
        orderBy: {
          displayOrder: 'desc',
        },

        select: {
          displayOrder: true,
        },
      });

      displayOrder = (lastBanner?.displayOrder ?? 0) + 1;
    }

    const data: Prisma.BannerCreateInput = {
      title: createDto.title,
      subtitle: createDto.subtitle ?? null,
      description: createDto.description ?? null,
      buttonText: createDto.buttonText ?? null,
      buttonLink: createDto.buttonLink ?? null,
      imageUrl: createDto.imageUrl,
      imagePublicId: createDto.imagePublicId,
      imageAltText: createDto.imageAltText,
      displayOrder,
      isActive: createDto.isActive ?? true,
    };

    return this.prisma.banner.create({
      data,
    });
  }

  async update(id: string, updateDto: UpdateBannerDto) {
    const existingBanner = await this.findOne(id);

    const imageUrlProvided = updateDto.imageUrl !== undefined;

    const imagePublicIdProvided = updateDto.imagePublicId !== undefined;

    if (imageUrlProvided !== imagePublicIdProvided) {
      throw new BadRequestException(
        'Image URL and image public ID must be provided together when replacing a banner image',
      );
    }

    const data: Prisma.BannerUpdateInput = {};

    if (updateDto.title !== undefined) {
      data.title = updateDto.title;
    }

    if (updateDto.subtitle !== undefined) {
      data.subtitle = updateDto.subtitle ?? null;
    }

    if (updateDto.description !== undefined) {
      data.description = updateDto.description ?? null;
    }

    if (updateDto.buttonText !== undefined) {
      data.buttonText = updateDto.buttonText ?? null;
    }

    if (updateDto.buttonLink !== undefined) {
      data.buttonLink = updateDto.buttonLink ?? null;
    }

    if (updateDto.imageUrl !== undefined) {
      data.imageUrl = updateDto.imageUrl;
    }

    if (updateDto.imagePublicId !== undefined) {
      data.imagePublicId = updateDto.imagePublicId;
    }

    if (updateDto.imageAltText !== undefined) {
      data.imageAltText = updateDto.imageAltText;
    }

    if (updateDto.displayOrder !== undefined) {
      data.displayOrder = updateDto.displayOrder;
    }

    if (updateDto.isActive !== undefined) {
      data.isActive = updateDto.isActive;
    }

    const updatedBanner = await this.prisma.banner.update({
      where: {
        id,
      },

      data,
    });

    const imageWasReplaced =
      updateDto.imagePublicId !== undefined &&
      updateDto.imagePublicId !== existingBanner.imagePublicId;

    if (imageWasReplaced) {
      await this.deleteStoredImageSafely(existingBanner.imagePublicId);
    }

    return updatedBanner;
  }

  async remove(id: string) {
    const existingBanner = await this.findOne(id);

    await this.prisma.banner.delete({
      where: {
        id,
      },
    });

    await this.deleteStoredImageSafely(existingBanner.imagePublicId);

    return existingBanner;
  }

  async reorder(reorderDto: ReorderBannersDto) {
    const existingBanners = await this.prisma.banner.findMany({
      select: {
        id: true,
      },
    });

    if (reorderDto.bannerIds.length !== existingBanners.length) {
      throw new BadRequestException(
        'The reorder request must contain every banner exactly once',
      );
    }

    const existingBannerIds = new Set(
      existingBanners.map((banner) => banner.id),
    );

    const containsUnknownBanner = reorderDto.bannerIds.some(
      (bannerId) => !existingBannerIds.has(bannerId),
    );

    if (containsUnknownBanner) {
      throw new BadRequestException(
        'The reorder request contains an unknown banner ID',
      );
    }

    await this.prisma.$transaction(
      reorderDto.bannerIds.map((bannerId, index) =>
        this.prisma.banner.update({
          where: {
            id: bannerId,
          },

          data: {
            displayOrder: index + 1,
          },
        }),
      ),
    );

    return this.findAll();
  }

  private async deleteStoredImageSafely(imagePublicId: string): Promise<void> {
    try {
      await this.storageService.deleteImage(imagePublicId);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown storage error';

      this.logger.warn(
        `The banner record was updated, but the old image could not be deleted from storage: ${errorMessage}`,
      );
    }
  }
}
