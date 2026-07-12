import { Module } from '@nestjs/common';
import { MediaModule } from '../media/media.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminBannersController } from './admin-banners.controller';
import { BannersService } from './banners.service';

@Module({
  imports: [PrismaModule, MediaModule],

  controllers: [AdminBannersController],

  providers: [BannersService],

  exports: [BannersService],
})
export class BannersModule {}
