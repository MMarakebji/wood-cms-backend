import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminPriceListsController } from './admin-price-lists.controller';
import { PriceListsService } from './price-lists.service';

@Module({
  imports: [PrismaModule],

  controllers: [AdminPriceListsController],

  providers: [PriceListsService],

  exports: [PriceListsService],
})
export class PriceListsModule {}
