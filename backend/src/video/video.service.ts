import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueueService } from 'src/queue/queue.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

import { Express } from 'express';
import { UploadVideoDto } from './dtos/upload-video.dto';

@Injectable()
export class VideoService {
  constructor(
    private prisma: PrismaService,
    private queueService: QueueService,
    private cloudinaryService: CloudinaryService,
  ) {}

  async uploadVideo(
    userId: number,
    file: Express.Multer.File,
    dto: UploadVideoDto,
  ) {
    if (!file?.path) throw new Error('No video file provided.');

    // Upload to Cloudinary
    const uploadResult = await this.cloudinaryService.uploadFile(
      file.path,
      'videos',
      'video',
    );

    // Create job in DB
    const job = await this.prisma.videoJob.create({
      data: {
        userId,
        videoUrl: uploadResult.secure_url,
        timestamps: Array.isArray(dto.timestamps) ? dto.timestamps : [],
      },
    });

    // Add to queue
    await this.queueService.addJob('video_jobs', { jobId: job.id });

    return {
      message: 'Video upload successful, processing queued',
      jobId: job.id,
    };
  }

  async getJobStatus(jobId: number) {
    return this.prisma.videoJob.findUnique({ where: { id: jobId } });
  }
}
