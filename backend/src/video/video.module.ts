import { Module } from '@nestjs/common';
import { VideoService } from './video.service';
import { VideoController } from './video.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { VideoProcessor } from './video.processor';
import { QueueService } from 'src/queue/queue.service';
import { EmailService } from 'src/email/email.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { BullModule } from '@nestjs/bullmq';
import { FileCleanupService } from 'src/file-cleanup/file-cleanup.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'video_jobs',
    }),
  ],
  providers: [
    VideoService,
    PrismaService,
    VideoProcessor,
    QueueService,
    EmailService,
    CloudinaryService,
    FileCleanupService,
  ],
  controllers: [VideoController],
})
export class VideoModule {}
