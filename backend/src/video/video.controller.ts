import {
  Controller,
  Post,
  Get,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Body,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { VideoService } from './video.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UploadVideoDto } from './dtos/upload-video.dto';

@ApiTags('Video')
@Controller('video')
export class VideoController {
  constructor(private videoService: VideoService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/videos',
        filename: (req, file, cb) => {
          const filename = `${Date.now()}-${file.originalname}`;
          cb(null, filename);
        },
      }),
    }),
  )
  @ApiOperation({ summary: 'Upload a video for thumbnail processing' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Video upload payload',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Video file to upload',
        },
        timestamps: {
          type: 'array',
          items: { type: 'number' },
          example: [1, 3, 5, 10],
          description: 'Timestamps (in seconds) for thumbnail generation',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Video uploaded successfully, job queued for processing',
    schema: {
      example: {
        message: 'Video upload successful, processing queued',
        jobId: 123,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or missing file',
  })
  uploadVideo(
    @Req() req: Request & { user: { userId: number; email: string } },
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadVideoDto,
  ) {
    return this.videoService.uploadVideo(req.user.userId, file, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':id/status')
  @ApiOperation({ summary: 'Get the processing status of a video job' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Video job ID',
    example: 42,
  })
  @ApiResponse({
    status: 200,
    description: 'Current status of the video job',
    schema: {
      example: {
        id: 42,
        status: 'completed',
        videoUrl: 'https://res.cloudinary.com/.../video.mp4',
        thumbnails: [
          'https://res.cloudinary.com/.../thumb1.jpg',
          'https://res.cloudinary.com/.../thumb2.jpg',
        ],
        timestamps: [1, 3, 5],
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Video job not found',
  })
  getStatus(@Param('id') id: number) {
    return this.videoService.getJobStatus(+id);
  }
}
