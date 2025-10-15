import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueueService } from 'src/queue/queue.service';
import { CreatePdfDto } from './dtos/create-pdf.dto';
import { MergeImagesDto } from './dtos/merge-images.dto';

@Injectable()
export class PdfService {
  constructor(
    private prisma: PrismaService,
    private queueService: QueueService,
  ) {}

  async generatePdf(userId: number, dto: CreatePdfDto) {
    const job = await this.prisma.pdfJob.create({
      data: {
        userId,
        type: 'generate',
        inputData: { ...dto },
      },
    });

    await this.queueService.addJob('pdf_generate', { jobId: job.id });
    return { message: 'PDF generation job queued', jobId: job.id };
  }

  async mergeImages(userId: number, dto: MergeImagesDto) {
    const job = await this.prisma.pdfJob.create({
      data: {
        userId,
        type: 'merge',
        inputData: { ...dto },
      },
    });

    await this.queueService.addJob('pdf_merge', { jobId: job.id });
    return { message: 'PDF merge job queued', jobId: job.id };
  }

  async getJobStatus(jobId: number) {
    return this.prisma.pdfJob.findUnique({ where: { id: jobId } });
  }
}
