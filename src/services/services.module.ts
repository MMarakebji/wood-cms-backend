import { Module } from '@nestjs/common';
import { MediaModule } from '../media/media.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminServicesController } from './admin-services.controller';
import { ServicesService } from './services.service';

@Module({
  imports: [PrismaModule, MediaModule],

  controllers: [AdminServicesController],

  providers: [ServicesService],

  exports: [ServicesService],
})
export class ServicesModule {}
