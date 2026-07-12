import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { SupabaseStorageService } from '../media/supabase-storage.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { ReorderServicesDto } from './dto/reorder-services.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  private readonly logger = new Logger(ServicesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: SupabaseStorageService,
  ) {}

  async findAll() {
    return this.prisma.service.findMany({
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
    const service = await this.prisma.service.findUnique({
      where: {
        id,
      },
    });

    if (!service) {
      throw new NotFoundException('Service was not found');
    }

    return service;
  }

  async create(createDto: CreateServiceDto) {
    this.validateCompleteImage(
      createDto.imageUrl,
      createDto.imagePublicId,
      createDto.imageAltText,
    );

    const slug = await this.generateUniqueSlug(
      createDto.slug ?? createDto.name,
    );

    let displayOrder = createDto.displayOrder;

    if (displayOrder === undefined) {
      const lastService = await this.prisma.service.findFirst({
        orderBy: {
          displayOrder: 'desc',
        },

        select: {
          displayOrder: true,
        },
      });

      displayOrder = (lastService?.displayOrder ?? 0) + 1;
    }

    const data: Prisma.ServiceCreateInput = {
      name: createDto.name,
      slug,
      shortDescription: createDto.shortDescription ?? null,
      description: createDto.description ?? null,
      imageUrl: createDto.imageUrl ?? null,
      imagePublicId: createDto.imagePublicId ?? null,
      imageAltText: createDto.imageAltText ?? null,
      displayOrder,
      isActive: createDto.isActive ?? true,
    };

    return this.prisma.service.create({
      data,
    });
  }

  async update(id: string, updateDto: UpdateServiceDto) {
    const existingService = await this.findOne(id);

    const replacingImage =
      updateDto.imageUrl !== undefined || updateDto.imagePublicId !== undefined;

    if (
      updateDto.removeImage &&
      (replacingImage || updateDto.imageAltText !== undefined)
    ) {
      throw new BadRequestException(
        'Image fields must not be provided when removeImage is true',
      );
    }

    if (replacingImage) {
      const nextImageAltText =
        updateDto.imageAltText ?? existingService.imageAltText;

      this.validateCompleteImage(
        updateDto.imageUrl,
        updateDto.imagePublicId,
        nextImageAltText,
      );
    }

    if (
      updateDto.imageAltText !== undefined &&
      !replacingImage &&
      !existingService.imageUrl
    ) {
      throw new BadRequestException(
        'Alternative text cannot be added because this service has no image',
      );
    }

    const data: Prisma.ServiceUpdateInput = {};

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

    if (updateDto.displayOrder !== undefined) {
      data.displayOrder = updateDto.displayOrder;
    }

    if (updateDto.isActive !== undefined) {
      data.isActive = updateDto.isActive;
    }

    if (updateDto.removeImage) {
      data.imageUrl = null;
      data.imagePublicId = null;
      data.imageAltText = null;
    } else {
      if (updateDto.imageUrl !== undefined) {
        data.imageUrl = updateDto.imageUrl ?? null;
      }

      if (updateDto.imagePublicId !== undefined) {
        data.imagePublicId = updateDto.imagePublicId ?? null;
      }

      if (updateDto.imageAltText !== undefined) {
        data.imageAltText = updateDto.imageAltText ?? null;
      }
    }

    const updatedService = await this.prisma.service.update({
      where: {
        id,
      },

      data,
    });

    const imageWasRemoved = updateDto.removeImage === true;

    const imageWasReplaced =
      updateDto.imagePublicId !== undefined &&
      updateDto.imagePublicId !== existingService.imagePublicId;

    if (
      existingService.imagePublicId &&
      (imageWasRemoved || imageWasReplaced)
    ) {
      await this.deleteStoredImageSafely(existingService.imagePublicId);
    }

    return updatedService;
  }

  async remove(id: string) {
    const existingService = await this.findOne(id);

    await this.prisma.service.delete({
      where: {
        id,
      },
    });

    if (existingService.imagePublicId) {
      await this.deleteStoredImageSafely(existingService.imagePublicId);
    }

    return existingService;
  }

  async reorder(reorderDto: ReorderServicesDto) {
    const existingServices = await this.prisma.service.findMany({
      select: {
        id: true,
      },
    });

    if (reorderDto.serviceIds.length !== existingServices.length) {
      throw new BadRequestException(
        'The reorder request must contain every service exactly once',
      );
    }

    const existingServiceIds = new Set(
      existingServices.map((service) => service.id),
    );

    const containsUnknownService = reorderDto.serviceIds.some(
      (serviceId) => !existingServiceIds.has(serviceId),
    );

    if (containsUnknownService) {
      throw new BadRequestException(
        'The reorder request contains an unknown service ID',
      );
    }

    await this.prisma.$transaction(
      reorderDto.serviceIds.map((serviceId, index) =>
        this.prisma.service.update({
          where: {
            id: serviceId,
          },

          data: {
            displayOrder: index + 1,
          },
        }),
      ),
    );

    return this.findAll();
  }

  private validateCompleteImage(
    imageUrl: string | null | undefined,
    imagePublicId: string | null | undefined,
    imageAltText: string | null | undefined,
  ): void {
    const suppliedImageValues = [imageUrl, imagePublicId, imageAltText].filter(
      (value) => typeof value === 'string' && value.trim().length > 0,
    ).length;

    if (suppliedImageValues > 0 && suppliedImageValues < 3) {
      throw new BadRequestException(
        'Image URL, image public ID, and image alternative text must be provided together',
      );
    }
  }

  private async generateUniqueSlug(
    source: string,
    excludedServiceId?: string,
  ): Promise<string> {
    const baseSlug = this.createSlug(source) || 'service';

    let candidateSlug = baseSlug;
    let suffix = 2;

    while (true) {
      const existingService = await this.prisma.service.findUnique({
        where: {
          slug: candidateSlug,
        },

        select: {
          id: true,
        },
      });

      if (!existingService || existingService.id === excludedServiceId) {
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
        `The service record was updated, but the old image could not be deleted from storage: ${errorMessage}`,
      );
    }
  }
}
