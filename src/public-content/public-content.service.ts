import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const PUBLIC_SERVICE_SELECT = {
  id: true,
  name: true,
  slug: true,
  shortDescription: true,
  description: true,
  imageUrl: true,
  imageAltText: true,
  displayOrder: true,
} satisfies Prisma.ServiceSelect;

const PUBLIC_PRODUCT_SELECT = {
  id: true,
  name: true,
  slug: true,
  shortDescription: true,
  description: true,
  basePrice: true,
  currency: true,
  priceUnit: true,
  displayOrder: true,

  features: {
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
      label: true,
      featureType: true,
      displayOrder: true,
    },
  },

  images: {
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
      imageUrl: true,
      altText: true,
      sortOrder: true,
      isPrimary: true,
    },
  },

  priceLists: {
    where: {
      isActive: true,
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
      listName: true,
      itemName: true,
      lengthMm: true,
      widthMm: true,
      thicknessMm: true,
      volumeM3: true,
      pricePerM3: true,
      pricePerPiece: true,
      currency: true,
      displayOrder: true,
    },
  },
} satisfies Prisma.ProductSelect;

const PUBLIC_PRICE_LIST_SELECT = {
  id: true,
  productId: true,
  listName: true,
  itemName: true,
  lengthMm: true,
  widthMm: true,
  thicknessMm: true,
  volumeM3: true,
  pricePerM3: true,
  pricePerPiece: true,
  currency: true,
  displayOrder: true,

  product: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
} satisfies Prisma.PriceListSelect;

type PublicProductRecord = Prisma.ProductGetPayload<{
  select: typeof PUBLIC_PRODUCT_SELECT;
}>;

type PublicPriceListRecord = Prisma.PriceListGetPayload<{
  select: typeof PUBLIC_PRICE_LIST_SELECT;
}>;

@Injectable()
export class PublicContentService {
  constructor(private readonly prisma: PrismaService) {}

  async getHomepage() {
    const [settings, sections, banners, services, products] = await Promise.all(
      [
        this.getHomepageSettings(),
        this.getHomepageSections(),
        this.getBanners(),
        this.getServices(),
        this.getProducts(),
      ],
    );

    return {
      settings,
      sections,
      banners,
      services,
      products,
    };
  }

  async getServices() {
    return this.prisma.service.findMany({
      where: {
        isActive: true,
      },

      orderBy: [
        {
          displayOrder: 'asc',
        },
        {
          createdAt: 'asc',
        },
      ],

      select: PUBLIC_SERVICE_SELECT,
    });
  }

  async getServiceBySlug(slug: string) {
    const normalizedSlug = slug.trim().toLowerCase();

    const service = await this.prisma.service.findFirst({
      where: {
        slug: normalizedSlug,
        isActive: true,
      },

      select: PUBLIC_SERVICE_SELECT,
    });

    if (!service) {
      throw new NotFoundException('Service was not found');
    }

    return service;
  }

  async getProducts() {
    const products = await this.prisma.product.findMany({
      where: {
        isActive: true,
      },

      orderBy: [
        {
          displayOrder: 'asc',
        },
        {
          createdAt: 'asc',
        },
      ],

      select: PUBLIC_PRODUCT_SELECT,
    });

    return products.map((product) => this.serializeProduct(product));
  }

  async getProductBySlug(slug: string) {
    const normalizedSlug = slug.trim().toLowerCase();

    const product = await this.prisma.product.findFirst({
      where: {
        slug: normalizedSlug,
        isActive: true,
      },

      select: PUBLIC_PRODUCT_SELECT,
    });

    if (!product) {
      throw new NotFoundException('Product was not found');
    }

    return this.serializeProduct(product);
  }

  async getPriceLists() {
    const priceLists = await this.prisma.priceList.findMany({
      where: {
        isActive: true,

        OR: [
          {
            productId: null,
          },
          {
            product: {
              is: {
                isActive: true,
              },
            },
          },
        ],
      },

      orderBy: [
        {
          displayOrder: 'asc',
        },
        {
          createdAt: 'asc',
        },
      ],

      select: PUBLIC_PRICE_LIST_SELECT,
    });

    return priceLists.map((priceList) => this.serializePriceList(priceList));
  }

  private async getHomepageSettings() {
    return this.prisma.homepageSetting.findUnique({
      where: {
        id: 1,
      },

      select: {
        id: true,
        companyName: true,
        logoUrl: true,
        logoAltText: true,
        phone: true,
        email: true,
        addressLine1: true,
        addressLine2: true,
        privacyPolicyText: true,
        privacyPolicyUrl: true,
        footerText: true,
      },
    });
  }

  private async getHomepageSections() {
    return this.prisma.homepageSection.findMany({
      where: {
        isActive: true,
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
        sectionKey: true,
        sectionType: true,
        title: true,
        subtitle: true,
        body: true,
        buttonText: true,
        buttonLink: true,
        backgroundImageUrl: true,
        backgroundImageAltText: true,
        displayOrder: true,

        images: {
          where: {
            isActive: true,
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
            imageUrl: true,
            altText: true,
            caption: true,
            displayOrder: true,
            isPrimary: true,
          },
        },

        items: {
          where: {
            isActive: true,
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
            title: true,
            description: true,
            iconName: true,
            displayOrder: true,
          },
        },
      },
    });
  }

  private async getBanners() {
    return this.prisma.banner.findMany({
      where: {
        isActive: true,
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
        title: true,
        subtitle: true,
        description: true,
        buttonText: true,
        buttonLink: true,
        imageUrl: true,
        imageAltText: true,
        displayOrder: true,
      },
    });
  }

  private serializeProduct(product: PublicProductRecord) {
    return {
      ...product,

      basePrice: product.basePrice?.toString() ?? null,

      priceLists: product.priceLists.map((priceList) => ({
        ...priceList,

        volumeM3: priceList.volumeM3?.toString() ?? null,

        pricePerM3: priceList.pricePerM3?.toString() ?? null,

        pricePerPiece: priceList.pricePerPiece?.toString() ?? null,
      })),
    };
  }

  private serializePriceList(priceList: PublicPriceListRecord) {
    return {
      ...priceList,

      volumeM3: priceList.volumeM3?.toString() ?? null,

      pricePerM3: priceList.pricePerM3?.toString() ?? null,

      pricePerPiece: priceList.pricePerPiece?.toString() ?? null,
    };
  }
}
