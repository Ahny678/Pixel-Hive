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

import { VideoService } from './video.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UploadVideoDto } from './dtos/upload-video.dto';

@Controller('video')
export class VideoController {
  constructor(private videoService: VideoService) {}

  @UseGuards(JwtAuthGuard)
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
  uploadVideo(
    @Req() req: Request & { user: { userId: number; email: string } },
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadVideoDto,
  ) {
    return this.videoService.uploadVideo(req.user.userId, file, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/status')
  getStatus(@Param('id') id: number) {
    return this.videoService.getJobStatus(+id);
  }
}
