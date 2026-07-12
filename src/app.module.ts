import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AdminsModule } from './admins/admins.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { HomepageModule } from './homepage/homepage.module';
import { MediaModule } from './media/media.module';
import { ContactMessagesModule } from './contact-messages/contact-messages.module';
import { BannersModule } from './banners/banners.module';
import { ServicesModule } from './services/services.module';
import { ProductsModule } from './products/products.module';
import { PriceListsModule } from './price-lists/price-lists.module';
import { PublicContentModule } from './public-content/public-content.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AdminsModule,
    AuthModule,
    HomepageModule,
    MediaModule,
    ContactMessagesModule,
    BannersModule,
    ServicesModule,
    ProductsModule,
    PriceListsModule,
    PublicContentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
