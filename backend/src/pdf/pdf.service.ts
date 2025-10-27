import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueueService } from 'src/queue/queue.service';
import { CreatePdfDto } from './dtos/create-pdf.dto';

import * as path from 'path';
import * as fs from 'fs';
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

    await this.queueService.addJob('jobs', { jobId: job.id });
    return { message: 'PDF generation job queued', jobId: job.id };
  }

  async mergeImages(
    userId: number,
    email: string,
    files: Express.Multer.File[],
  ) {
    // Save uploaded images temporarily to disk
    const uploadDir = path.join(__dirname, '../../../storage/uploads');
    fs.mkdirSync(uploadDir, { recursive: true });

    const imagePaths: string[] = [];

    for (const file of files) {
      const tempPath = path.join(uploadDir, file.originalname);
      fs.writeFileSync(tempPath, file.buffer);
      imagePaths.push(tempPath);
    }
    const job = await this.prisma.pdfJob.create({
      data: {
        userId,
        type: 'merge',
        inputData: { images: imagePaths, email },
      },
    });

    await this.queueService.addJob('jobs', { jobId: job.id });

    return { message: 'PDF merge job queued', jobId: job.id };
  }

  async getJobStatus(jobId: number) {
    return this.prisma.pdfJob.findUnique({ where: { id: jobId } });
  }
}
