import { Module } from '@nestjs/common';
import { MediaModule } from '../media/media.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminProductFeaturesController } from './admin-product-features.controller';
import { AdminProductImagesController } from './admin-product-images.controller';
import { AdminProductsController } from './admin-products.controller';
import { ProductFeaturesService } from './product-features.service';
import { ProductImagesService } from './product-images.service';
import { ProductsService } from './products.service';

@Module({
  imports: [PrismaModule, MediaModule],

  controllers: [
    AdminProductsController,
    AdminProductFeaturesController,
    AdminProductImagesController,
  ],

  providers: [ProductsService, ProductFeaturesService, ProductImagesService],

  exports: [ProductsService, ProductFeaturesService, ProductImagesService],
})
export class ProductsModule {}
