import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import * as argon2 from 'argon2';
import { PrismaClient } from '../src/generated/prisma/client';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined.');
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

async function main(): Promise<void> {
  /*
   * Seed administrator
   */

  const email = process.env.SEED_ADMIN_EMAIL
    ?.trim()
    .toLowerCase();

  const password = process.env.SEED_ADMIN_PASSWORD;

  const fullName =
    process.env.SEED_ADMIN_FULL_NAME?.trim() ||
    'System Administrator';

  if (!email) {
    throw new Error(
      'SEED_ADMIN_EMAIL is not defined.',
    );
  }

  if (!password) {
    throw new Error(
      'SEED_ADMIN_PASSWORD is not defined.',
    );
  }

  const passwordHash = await argon2.hash(password);

  const admin = await prisma.admin.upsert({
    where: {
      email,
    },
    update: {
      fullName,
      passwordHash,
      isActive: true,
    },
    create: {
      email,
      fullName,
      passwordHash,
      isActive: true,
    },
  });

  console.log(
    `Administrator seeded: ${admin.email}`,
  );

  /*
   * Seed singleton homepage settings
   */

  const homepageSettings =
    await prisma.homepageSetting.upsert({
      where: {
        id: 1,
      },
      update: {},
      create: {
        id: 1,
        companyName: 'Wood Products',
        logoUrl:
          'https://placehold.co/240x80?text=Wood+Products',
        logoPublicId:
          'seed/wood-products-placeholder-logo',
        logoAltText:
          'Wood Products company logo',
        phone: '+961 1 000 000',
        email: 'info@woodproducts.com',
        addressLine1: 'Beirut',
        addressLine2: 'Lebanon',
        privacyPolicyText: 'Privacy Policy',
        privacyPolicyUrl: '/privacy-policy',
        footerText:
          '© 2026 Wood Products. All rights reserved.',
      },
    });
  const defaultSections = [
    {
      sectionKey: 'hero',
      sectionType: 'hero',
      title: 'Quality Wood for Every Project',
      subtitle:
        'Wood products and professional services',
      body:
        'Discover dependable wood products selected for construction, furniture, and interior projects.',
      buttonText: 'Explore Our Products',
      buttonLink: '#wood-types',
      displayOrder: 0,
    },
    {
      sectionKey: 'wood-types',
      sectionType: 'product-grid',
      title: 'Our Wood Types',
      subtitle:
        'Explore our available wood products',
      displayOrder: 1,
    },
    {
      sectionKey: 'our-work',
      sectionType: 'gallery',
      title: 'Our Work',
      subtitle:
        'A selection of completed wood projects',
      displayOrder: 2,
    },
    {
      sectionKey: 'advantages',
      sectionType: 'list',
      title: 'Advantages of Working With Us',
      displayOrder: 3,
    },
    {
      sectionKey: 'about',
      sectionType: 'split',
      title: 'About Us',
      body:
        'We provide reliable wood products and professional services for different project requirements.',
      displayOrder: 4,
    },
    {
      sectionKey: 'contact',
      sectionType: 'contact',
      title: 'Any Questions?',
      subtitle:
        'Contact our team for more information',
      displayOrder: 5,
    },
  ] as const;

  for (const section of defaultSections) {
    await prisma.homepageSection.upsert({
      where: {
        sectionKey: section.sectionKey,
      },
      update: {},
      create: {
        ...section,
        isActive: true,
      },
    });
  }

  console.log(
    `${defaultSections.length} homepage sections seeded.`,
  );

  console.log(
    `Homepage settings seeded: ${homepageSettings.companyName}`,
  );
  const heroSection =
    await prisma.homepageSection.findUnique({
      where: {
        sectionKey: 'hero',
      },
      select: {
        id: true,
      },
    });

  if (!heroSection) {
    throw new Error(
      'The hero homepage section was not seeded.',
    );
  }

  const heroImageCount =
    await prisma.homepageSectionImage.count({
      where: {
        sectionId: heroSection.id,
      },
    });

  if (heroImageCount === 0) {
    await prisma.homepageSectionImage.createMany({
      data: [
        {
          sectionId: heroSection.id,
          imageUrl:
            'https://placehold.co/600x400?text=Wood+Product+1',
          imagePublicId:
            'seed/what-we-offer-image-1',
          altText: 'Wood product image one',
          displayOrder: 0,
          isPrimary: true,
          isActive: true,
        },
        {
          sectionId: heroSection.id,
          imageUrl:
            'https://placehold.co/600x400?text=Wood+Product+2',
          imagePublicId:
            'seed/what-we-offer-image-2',
          altText: 'Wood product image two',
          displayOrder: 1,
          isPrimary: false,
          isActive: true,
        },
        {
          sectionId: heroSection.id,
          imageUrl:
            'https://placehold.co/600x400?text=Wood+Product+3',
          imagePublicId:
            'seed/what-we-offer-image-3',
          altText: 'Wood product image three',
          displayOrder: 2,
          isPrimary: false,
          isActive: true,
        },
      ],
    });

    console.log(
      'Three What We Offer images seeded.',
    );
  } else {
    console.log(
      'What We Offer images already exist.',
    );
  }
  const materialsSection =
    await prisma.homepageSection.findUnique({
      where: {
        sectionKey: 'wood-types',
      },
      select: {
        id: true,
      },
    });

  if (!materialsSection) {
    throw new Error(
      'The wood-types homepage section was not seeded.',
    );
  }

  const materialsItemCount =
    await prisma.homepageSectionItem.count({
      where: {
        sectionId: materialsSection.id,
      },
    });

  const materialsImageCount =
    await prisma.homepageSectionImage.count({
      where: {
        sectionId: materialsSection.id,
      },
    });

  if (
    materialsItemCount === 0 &&
    materialsImageCount === 0
  ) {
    const materials = [
      {
        name: 'Oak',
        description:
          'Durable hardwood suitable for furniture, flooring, and interior projects.',
        imageUrl:
          'https://placehold.co/600x800?text=Oak',
        imagePublicId:
          'seed/materials/oak',
        altText: 'Oak wood material',
      },
      {
        name: 'Beech',
        description:
          'Strong and versatile wood with a smooth, uniform appearance.',
        imageUrl:
          'https://placehold.co/600x800?text=Beech',
        imagePublicId:
          'seed/materials/beech',
        altText: 'Beech wood material',
      },
      {
        name: 'Ash',
        description:
          'Flexible and attractive wood suitable for furniture and joinery.',
        imageUrl:
          'https://placehold.co/600x800?text=Ash',
        imagePublicId:
          'seed/materials/ash',
        altText: 'Ash wood material',
      },
    ];

    await prisma.homepageSectionItem.createMany({
      data: materials.map(
        (material, index) => ({
          sectionId: materialsSection.id,
          title: material.name,
          description: material.description,
          displayOrder: index,
          isActive: true,
        }),
      ),
    });

    await prisma.homepageSectionImage.createMany({
      data: materials.map(
        (material, index) => ({
          sectionId: materialsSection.id,
          imageUrl: material.imageUrl,
          imagePublicId:
            material.imagePublicId,
          altText: material.altText,
          caption: material.name,
          displayOrder: index,
          isPrimary: index === 0,
          isActive: true,
        }),
      ),
    });

    console.log(
      'Three material cards seeded.',
    );
  } else {
    console.log(
      'Materials content already exists.',
    );
  }

  const productPhotosSection =
    await prisma.homepageSection.findUnique({
      where: {
        sectionKey: 'our-work',
      },
      select: {
        id: true,
      },
    });

  if (!productPhotosSection) {
    throw new Error(
      'The our-work homepage section was not seeded.',
    );
  }

  const productPhotosCount =
    await prisma.homepageSectionImage.count({
      where: {
        sectionId: productPhotosSection.id,
      },
    });

  if (productPhotosCount === 0) {
    const productPhotos = [
      {
        imageUrl:
          'https://placehold.co/1200x800?text=Product+Photo+1',
        imagePublicId:
          'seed/product-photos/photo-1',
        altText:
          'Wood product photo one',
        caption: 'Wood product project one',
      },
      {
        imageUrl:
          'https://placehold.co/1200x800?text=Product+Photo+2',
        imagePublicId:
          'seed/product-photos/photo-2',
        altText:
          'Wood product photo two',
        caption: 'Wood product project two',
      },
      {
        imageUrl:
          'https://placehold.co/1200x800?text=Product+Photo+3',
        imagePublicId:
          'seed/product-photos/photo-3',
        altText:
          'Wood product photo three',
        caption: 'Wood product project three',
      },
      {
        imageUrl:
          'https://placehold.co/1200x800?text=Product+Photo+4',
        imagePublicId:
          'seed/product-photos/photo-4',
        altText:
          'Wood product photo four',
        caption: 'Wood product project four',
      },
    ];

    await prisma.homepageSectionImage.createMany({
      data: productPhotos.map(
        (photo, index) => ({
          sectionId: productPhotosSection.id,
          imageUrl: photo.imageUrl,
          imagePublicId:
            photo.imagePublicId,
          altText: photo.altText,
          caption: photo.caption,
          displayOrder: index,
          isPrimary: index === 0,
          isActive: true,
        }),
      ),
    });

    console.log(
      'Product Photos gallery seeded.',
    );
  } else {
    console.log(
      'Product Photos gallery already exists.',
    );
  }
  const workStagesSection =
    await prisma.homepageSection.findUnique({
      where: {
        sectionKey: 'advantages',
      },
      select: {
        id: true,
      },
    });

  if (!workStagesSection) {
    throw new Error(
      'The advantages homepage section was not seeded.',
    );
  }

  const workStagesItemCount =
    await prisma.homepageSectionItem.count({
      where: {
        sectionId: workStagesSection.id,
      },
    });

  const workStagesImageCount =
    await prisma.homepageSectionImage.count({
      where: {
        sectionId: workStagesSection.id,
      },
    });

  if (
    workStagesItemCount === 0 &&
    workStagesImageCount === 0
  ) {
    const workStages = [
      'Contact our team and describe the product or service you need.',
      'We confirm the requirements, materials, price, and estimated completion time.',
      'Our team prepares the order and contacts you when it is ready.',
    ];

    await prisma.homepageSectionItem.createMany({
      data: workStages.map(
        (description, index) => ({
          sectionId: workStagesSection.id,
          title: null,
          description,
          iconName: null,
          displayOrder: index,
          isActive: true,
        }),
      ),
    });

    await prisma.homepageSectionImage.create({
      data: {
        sectionId: workStagesSection.id,
        imageUrl:
          'https://placehold.co/900x700?text=Work+Stages',
        imagePublicId:
          'seed/work-stages/main-image',
        altText:
          'Woodworking professional preparing a product',
        caption: null,
        displayOrder: 0,
        isPrimary: true,
        isActive: true,
      },
    });

    console.log(
      'Work Stages content seeded.',
    );
  } else {
    console.log(
      'Work Stages content already exists.',
    );
  }
  const aboutUsSection =
    await prisma.homepageSection.findUnique({
      where: {
        sectionKey: 'about',
      },
      select: {
        id: true,
      },
    });

  if (!aboutUsSection) {
    throw new Error(
      'The About Us homepage section was not seeded.',
    );
  }

  const aboutUsImageCount =
    await prisma.homepageSectionImage.count({
      where: {
        sectionId: aboutUsSection.id,
      },
    });

  if (aboutUsImageCount === 0) {
    const aboutUsImages = [
      {
        imageUrl:
          'https://placehold.co/700x900?text=About+Us+1',
        imagePublicId:
          'seed/about-us/image-1',
        altText:
          'Woodworking team inside the workshop',
      },
      {
        imageUrl:
          'https://placehold.co/700x900?text=About+Us+2',
        imagePublicId:
          'seed/about-us/image-2',
        altText:
          'Craftsperson working on a wooden product',
      },
      {
        imageUrl:
          'https://placehold.co/700x900?text=About+Us+3',
        imagePublicId:
          'seed/about-us/image-3',
        altText:
          'Completed handcrafted wooden product',
      },
    ];

    await prisma.homepageSectionImage.createMany({
      data: aboutUsImages.map(
        (image, index) => ({
          sectionId: aboutUsSection.id,
          imageUrl: image.imageUrl,
          imagePublicId:
            image.imagePublicId,
          altText: image.altText,
          caption: null,
          displayOrder: index,
          isPrimary: index === 0,
          isActive: true,
        }),
      ),
    });

    console.log(
      'Three About Us images seeded.',
    );
  } else {
    console.log(
      'About Us images already exist.',
    );
  }
  const contactSection =
    await prisma.homepageSection.findUnique({
      where: {
        sectionKey: 'contact',
      },
      select: {
        id: true,
      },
    });

  if (!contactSection) {
    throw new Error(
      'The Contact homepage section was not seeded.',
    );
  }

  const contactFieldCount =
    await prisma.homepageSectionItem.count({
      where: {
        sectionId: contactSection.id,
      },
    });

  if (contactFieldCount === 0) {
    await prisma.homepageSectionItem.createMany({
      data: [
        {
          sectionId: contactSection.id,
          title: 'Your name',
          description: 'Enter your full name',
          iconName: 'name',
          displayOrder: 0,
          isActive: true,
        },
        {
          sectionId: contactSection.id,
          title: 'Phone number',
          description: 'Enter your phone number',
          iconName: 'phone',
          displayOrder: 1,
          isActive: true,
        },
        {
          sectionId: contactSection.id,
          title: 'Your question',
          description:
            'Describe the product or service you need',
          iconName: 'question',
          displayOrder: 2,
          isActive: true,
        },
      ],
    });

    console.log(
      'Three Contact Form fields seeded.',
    );
  } else {
    console.log(
      'Contact Form fields already exist.',
    );
  }
}

main()
  .catch((error: unknown) => {
    console.error(
      'Database seeding failed:',
      error,
    );

    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });