import { Module } from '@nestjs/common';
import { AboutUsController } from './about-us.controller';
import { AboutUsService } from './about-us.service';
import { AdminHomepageSectionsController } from './admin-homepage-sections.controller';
import { AdminHomepageController } from './admin-homepage.controller';
import { ContactFormController } from './contact-form.controller';
import { ContactFormService } from './contact-form.service';
import { HomepageSectionsController } from './homepage-sections.controller';
import { HomepageSectionsService } from './homepage-sections.service';
import { HomepageController } from './homepage.controller';
import { HomepageService } from './homepage.service';
import { MaterialsController } from './materials.controller';
import { MaterialsService } from './materials.service';
import { ProductPhotosController } from './product-photos.controller';
import { ProductPhotosService } from './product-photos.service';
import { WhatWeOfferController } from './what-we-offer.controller';
import { WhatWeOfferService } from './what-we-offer.service';
import { WorkStagesController } from './work-stages.controller';
import { WorkStagesService } from './work-stages.service';
import { PublicContactFormController } from './public-contact-form.controller';
@Module({
  controllers: [
    HomepageController,
    AdminHomepageController,
    HomepageSectionsController,
    AdminHomepageSectionsController,
    WhatWeOfferController,
    MaterialsController,
    ProductPhotosController,
    WorkStagesController,
    AboutUsController,
    ContactFormController,
    PublicContactFormController,
  ],
  providers: [
    HomepageService,
    HomepageSectionsService,
    WhatWeOfferService,
    MaterialsService,
    ProductPhotosService,
    WorkStagesService,
    AboutUsService,
    ContactFormService,
  ],
  exports: [
    HomepageService,
    HomepageSectionsService,
    WhatWeOfferService,
    MaterialsService,
    ProductPhotosService,
    WorkStagesService,
    AboutUsService,
    ContactFormService,
  ],
})
export class HomepageModule {}
