import { Module } from '@nestjs/common';
import { WatermarkService } from './watermark.service';
import { WatermarkController } from './watermark.controller';
import { WatermarkProcessor } from './watermark.processor';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueueService } from 'src/queue/queue.service';
import { EmailService } from 'src/email/email.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { FileCleanupService } from 'src/file-cleanup/file-cleanup.service';
import { WatermarkProcessorHelper } from './watermark.helper';

@Module({
  providers: [
    WatermarkService,
    PrismaService,
    WatermarkProcessor,
    QueueService,
    EmailService,
    CloudinaryService,
    WatermarkProcessorHelper,
    FileCleanupService,
  ],
  controllers: [WatermarkController],
})
export class WatermarkModule {}
