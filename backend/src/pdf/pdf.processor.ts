import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

import * as fs from 'fs';
import * as path from 'path';
import PDFDocument from 'pdfkit';
import sharp from 'sharp';
import { EmailService } from 'src/email/email.service';
import { PrismaService } from 'src/prisma/prisma.service';

interface PdfJobData {
  jobId: number;
}

interface PdfJobInputData {
  text?: string;
  html?: string;
  images?: string[];
}

@Processor('jobs')
export class PdfProcessor extends WorkerHost {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {
    super();
  }

  async process(job: Job<PdfJobData>): Promise<void> {
    const { jobId } = job.data;

    const pdfJob = await this.prisma.pdfJob.findUnique({
      where: { id: jobId },
      include: { user: true },
    });

    if (!pdfJob || !pdfJob.user) return;

    await this.prisma.pdfJob.update({
      where: { id: jobId },
      data: { status: 'processing' },
    });

    try {
      const outputDir = path.join(__dirname, '../../../storage');
      fs.mkdirSync(outputDir, { recursive: true });

      const outputPath = path.join(outputDir, `pdf_${jobId}.pdf`);

      const inputData = pdfJob.inputData as PdfJobInputData;

      if (pdfJob.type === 'generate') {
        await this.generatePdfFromTextOrHtml(inputData, outputPath);
      } else if (pdfJob.type === 'merge') {
        if (!inputData.images || !Array.isArray(inputData.images)) {
          throw new Error('No images provided for merge.');
        }
        await this.mergeImagesIntoPdf(inputData.images, outputPath);
      }

      await this.prisma.pdfJob.update({
        where: { id: jobId },
        data: { status: 'completed', outputUrl: outputPath },
      });

      await this.emailService.sendJobStatusEmail(
        pdfJob.user.email,
        'PDF Processing',
        'success',
        `Download your file at ${outputPath}`,
      );
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);

      await this.prisma.pdfJob.update({
        where: { id: jobId },
        data: { status: 'failed', errorMsg: errorMessage },
      });

      await this.emailService.sendJobStatusEmail(
        pdfJob.user.email,
        'PDF Processing',
        'failed',
        errorMessage,
      );
    }
  }

  private async generatePdfFromTextOrHtml(
    data: PdfJobInputData,
    outputPath: string,
  ): Promise<void> {
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(outputPath);

    doc.pipe(stream);

    if (data.text) doc.text(data.text);
    if (data.html) doc.text(data.html.replace(/<[^>]*>/g, '')); // simple fallback

    doc.end();

    await new Promise<void>((resolve, reject) => {
      stream.on('finish', resolve);
      stream.on('error', reject);
    });
  }

  private async mergeImagesIntoPdf(
    images: string[],
    outputPath: string,
  ): Promise<void> {
    const doc = new PDFDocument({ autoFirstPage: false });
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    for (const imgPath of images) {
      const buffer = await sharp(imgPath).resize(600).png().toBuffer();
      const metadata = await sharp(buffer).metadata();
      const width = metadata.width ?? 600;
      const height = metadata.height ?? 800;

      doc.addPage({ size: [width, height] });
      doc.image(buffer, 0, 0, { width, height });
    }

    doc.end();

    await new Promise<void>((resolve, reject) => {
      stream.on('finish', resolve);
      stream.on('error', reject);
    });
  }
}
