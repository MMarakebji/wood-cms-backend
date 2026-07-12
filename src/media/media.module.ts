import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MediaController } from './media.controller';
import { SupabaseStorageService } from './supabase-storage.service';

@Module({
  imports: [ConfigModule],

  controllers: [MediaController],

  providers: [SupabaseStorageService],

  exports: [SupabaseStorageService],
})
export class MediaModule {}
