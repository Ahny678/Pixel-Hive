import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import * as fs from 'fs';
import * as path from 'path';
import * as PDFDocument from 'pdfkit';
import * as sharp from 'sharp';
import * as puppeteer from 'puppeteer';
import { EmailService } from 'src/email/email.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { FileCleanupService } from 'src/file-cleanup/file-cleanup.service';

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
    private readonly cloudinaryService: CloudinaryService,
    private readonly fileCleanupService: FileCleanupService,
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

    const outputDir = path.join(__dirname, '../../../storage');
    fs.mkdirSync(outputDir, { recursive: true });

    const outputPath = path.join(outputDir, `pdf_${jobId}.pdf`);
    const inputData = pdfJob.inputData as PdfJobInputData;

    try {
      // Generate or merge PDF
      if (pdfJob.type === 'generate') {
        await this.generatePdfFromTextOrHtml(inputData, outputPath);
      } else if (pdfJob.type === 'merge') {
        if (!inputData.images || !Array.isArray(inputData.images)) {
          throw new Error('No images provided for merge.');
        }
        await this.mergeImagesIntoPdf(inputData.images, outputPath);
      }

      // Upload to Cloudinary
      const uploadResult = await this.cloudinaryService.uploadFile(
        outputPath,
        'pdfs',
        'raw',
      );

      const publicUrl = uploadResult.secure_url;

      //  Update DB with Cloudinary URL
      await this.prisma.pdfJob.update({
        where: { id: jobId },
        data: { status: 'completed', outputUrl: publicUrl },
      });

      //  Send email with public URL
      await this.emailService.sendJobStatusEmail(
        pdfJob.user.email,
        'PDF Processing',
        'success',
        `Download your file <a href="${publicUrl}">${publicUrl}</a>`,
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
    // After successful Cloudinary upload:
    await this.fileCleanupService.deleteFiles([outputPath]);

    // If merged images were used:
    if (inputData.images) {
      await this.fileCleanupService.deleteFiles(inputData.images);
    }
  }

  //  Generate PDF from text or HTML
  private async generatePdfFromTextOrHtml(
    data: PdfJobInputData,
    outputPath: string,
  ): Promise<void> {
    //  If HTML is provided, use Puppeteer for full rendering
    if (data.html && data.html.trim().length > 0) {
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      const page = await browser.newPage();

      // Set content and wait for resources (CSS/fonts)
      await page.setContent(data.html, { waitUntil: 'networkidle0' });

      // Export to PDF (A4 by default)
      await page.pdf({
        path: outputPath,
        format: 'A4',
        printBackground: true,
        margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' },
      });

      await browser.close();
      return;
    }

    // ✅ Otherwise, fallback to PDFKit for plain text
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    doc.fontSize(12).text(data.text || 'No content provided.');
    doc.end();

    await new Promise<void>((resolve, reject) => {
      stream.on('finish', resolve);
      stream.on('error', reject);
    });
  }

  //  Merge multiple images into a single PDF
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
