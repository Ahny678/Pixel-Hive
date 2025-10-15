import { Module } from '@nestjs/common';
import { PdfService } from './pdf.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { PdfController } from './pdf.controller';
import { PdfProcessor } from './pdf.processor';
import { QueueService } from 'src/queue/queue.service';
import { EmailService } from 'src/email/email.service';

@Module({
  imports: [],
  providers: [
    PdfService,
    PrismaService,
    PdfProcessor,
    QueueService,
    EmailService,
  ],
  controllers: [PdfController],
})
export class PdfModule {}
