import {
  Controller,
  HttpStatus,
  ParseFilePipeBuilder,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SupabaseStorageService } from './supabase-storage.service';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;

@ApiTags('Admin — Media')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('admin/media')
export class MediaController {
  constructor(private readonly storageService: SupabaseStorageService) {}

  @Post('images')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),

      limits: {
        fileSize: MAX_IMAGE_SIZE,
        files: 1,
      },
    }),
  )
  @ApiOperation({
    summary: 'Upload one homepage image to Supabase Storage',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],

      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'JPEG, PNG, or WebP image with a maximum size of 5 MB',
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Image uploaded successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Administrator authentication is required',
  })
  @ApiUnprocessableEntityResponse({
    description: 'The file is missing, too large, or unsupported',
  })
  async uploadImage(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /^image\/(jpeg|png|webp)$/,
        })
        .addMaxSizeValidator({
          maxSize: MAX_IMAGE_SIZE,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
  ) {
    const image = await this.storageService.uploadImage(file);

    return {
      success: true,
      message: 'Image uploaded successfully',
      data: {
        image,
      },
    };
  }

  @Post('videos')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: MAX_VIDEO_SIZE,
        files: 1,
      },
    }),
  )
  @ApiOperation({
    summary: 'Upload one homepage video to Supabase Storage',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'MP4 or WebM video with a maximum size of 50 MB',
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Video uploaded successfully',
  })
  async uploadVideo(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /^video\/(mp4|webm)$/,
        })
        .addMaxSizeValidator({
          maxSize: MAX_VIDEO_SIZE,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
  ) {
    const video = await this.storageService.uploadVideo(file);

    return {
      success: true,
      message: 'Video uploaded successfully',
      data: {
        image: video,
      },
    };
  }
}
