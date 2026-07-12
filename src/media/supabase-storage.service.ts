import {
  BadGatewayException,
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'node:crypto';
import type { UploadedImage } from './types/uploaded-image.type';

const FILE_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

const VIDEO_EXTENSIONS: Record<string, string> = {
  'video/mp4': 'mp4',
  'video/webm': 'webm',
};

@Injectable()
export class SupabaseStorageService {
  private readonly supabase: ReturnType<typeof createClient>;
  private readonly bucketName: string;

  constructor(private readonly configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL')?.trim();

    const supabaseSecretKey = this.configService
      .get<string>('SUPABASE_SECRET_KEY')
      ?.trim();

    this.bucketName =
      this.configService.get<string>('SUPABASE_STORAGE_BUCKET')?.trim() ||
      'homepage-images';

    if (!supabaseUrl || !supabaseSecretKey) {
      throw new Error(
        'Supabase Storage configuration is missing. Check SUPABASE_URL and SUPABASE_SECRET_KEY.',
      );
    }

    this.supabase = createClient(supabaseUrl, supabaseSecretKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
  }

  async uploadImage(file: Express.Multer.File): Promise<UploadedImage> {
    return this.uploadFile(file, FILE_EXTENSIONS);
  }

  async uploadVideo(file: Express.Multer.File): Promise<UploadedImage> {
    return this.uploadFile(file, VIDEO_EXTENSIONS);
  }

  private async uploadFile(
    file: Express.Multer.File,
    extensions: Record<string, string>,
  ): Promise<UploadedImage> {
    if (!file.buffer) {
      throw new BadRequestException('The uploaded image data is missing.');
    }

    const extension = extensions[file.mimetype];

    if (!extension) {
      throw new BadRequestException(
        'The selected media format is not supported.',
      );
    }

    const year = new Date().getUTCFullYear();

    const objectPath = `homepage/${year}/${randomUUID()}.${extension}`;

    const { data, error } = await this.supabase.storage
      .from(this.bucketName)
      .upload(objectPath, file.buffer, {
        contentType: file.mimetype,
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw new BadGatewayException(
        `Supabase image upload failed: ${error.message}`,
      );
    }

    const { data: publicUrlData } = this.supabase.storage
      .from(this.bucketName)
      .getPublicUrl(data.path);

    if (!publicUrlData.publicUrl) {
      throw new BadGatewayException(
        'Supabase did not return a public image URL.',
      );
    }

    return {
      imageUrl: publicUrlData.publicUrl,
      imagePublicId: data.path,
      fileName: file.originalname,
      mimeType: file.mimetype,
      bytes: file.size,
    };
  }

  async deleteImage(imagePublicId: string): Promise<void> {
    const objectPath = imagePublicId.trim();

    if (!objectPath) {
      throw new BadRequestException('The image object path is required.');
    }

    const { error } = await this.supabase.storage
      .from(this.bucketName)
      .remove([objectPath]);

    if (error) {
      throw new BadGatewayException(
        `Supabase image deletion failed: ${error.message}`,
      );
    }
  }
}
