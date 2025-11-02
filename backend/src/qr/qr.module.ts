import { Module } from '@nestjs/common';
import { QrService } from './qr.service';
import { QrController } from './qr.controller';
import { BullModule } from '@nestjs/bullmq';
import { PrismaService } from 'src/prisma/prisma.service';
import { QrProcessor } from './qr.processor';
import { QueueService } from 'src/queue/queue.service';
import { EmailService } from 'src/email/email.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { FileCleanupService } from 'src/file-cleanup/file-cleanup.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'qr-jobs',
    }),
  ],
  providers: [
    QrService,
    PrismaService,
    QrProcessor,
    QueueService,
    EmailService,
    CloudinaryService,
    FileCleanupService,
  ],
  controllers: [QrController],
})
export class QrModule {}
