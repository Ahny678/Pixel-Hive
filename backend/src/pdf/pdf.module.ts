import { Module } from '@nestjs/common';
import { PdfService } from './pdf.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { PdfController } from './pdf.controller';
import { PdfProcessor } from './pdf.processor';
import { QueueService } from 'src/queue/queue.service';
import { EmailService } from 'src/email/email.service';
import { BullModule } from '@nestjs/bullmq';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { FileCleanupService } from 'src/file-cleanup/file-cleanup.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'jobs',
    }),
  ],
  providers: [
    PdfService,
    PrismaService,
    PdfProcessor,
    QueueService,
    EmailService,
    CloudinaryService,
    FileCleanupService,
  ],
  controllers: [PdfController],
})
export class PdfModule {}
