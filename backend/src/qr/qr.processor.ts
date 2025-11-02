import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { InternalServerErrorException, Logger } from '@nestjs/common';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { EmailService } from '../email/email.service';

import * as QRCode from 'qrcode';

import { Jimp } from 'jimp';
import { FileCleanupService } from 'src/file-cleanup/file-cleanup.service';

const QrCodeReader = require('qrcode-reader');

// 🧩 Define strict job types
interface GenerateQrJob {
  type: 'generate';
  data: string;
  userEmail?: string;
}

interface DecodeQrJob {
  type: 'decode';
  filePath: string;
  userEmail?: string;
}

type QrJobData = GenerateQrJob | DecodeQrJob;

interface CloudinaryUploadResult {
  secure_url: string;
}

@Processor('qr-jobs')
export class QrProcessor extends WorkerHost {
  private readonly logger = new Logger(QrProcessor.name);

  constructor(
    private readonly cloudinaryService: CloudinaryService,
    private readonly emailService: EmailService,
    private readonly fileCleanupService: FileCleanupService,
  ) {
    super();
  }

  async process(job: Job<QrJobData>): Promise<unknown> {
    const { type, userEmail } = job.data;

    try {
      let result: { url?: string; decoded?: string };

      if (type === 'generate') {
        result = await this.handleGenerate(job as Job<GenerateQrJob>);
      } else if (type === 'decode') {
        result = await this.handleDecode(job as Job<DecodeQrJob>);
      } else {
        throw new Error(`Unknown QR job type: ${String(type)}`);
      }

      // Email success
      if (userEmail) {
        const message =
          type === 'generate'
            ? `QR Code: <a href="${result.url ?? '#'}">${result.url ?? 'N/A'}</a>`
            : `Decoded: ${result.decoded ?? 'N/A'}`;

        await this.emailService.sendJobStatusEmail(
          userEmail,
          `QR ${type}`,
          'success',
          message,
        );
      }

      return result;
    } catch (error: unknown) {
      const err: Error =
        error instanceof Error
          ? error
          : new Error(typeof error === 'string' ? error : 'Unknown error');

      this.logger.error(
        `[QR ${job.data.type}] Error: ${err.message}`,
        err.stack,
      );

      if (job.data.userEmail) {
        await this.emailService.sendJobStatusEmail(
          job.data.userEmail,
          `QR ${job.data.type}`,
          'failed',
          err.message,
        );
      }

      throw new InternalServerErrorException(
        `QR ${job.data.type} failed: ${err.message}`,
      );
    }
  }

  //  Generate QR Code
  private async handleGenerate(
    job: Job<GenerateQrJob>,
  ): Promise<{ url: string }> {
    const { data } = job.data;
    if (!data) throw new Error('Missing "data" for QR generation.');

    const qrBuffer = await QRCode.toBuffer(data, {
      width: 300,
      margin: 2,
    });

    const upload = (await this.cloudinaryService.uploadBuffer(
      qrBuffer,
      'qrcodes',
    )) as CloudinaryUploadResult;

    if (!upload?.secure_url) throw new Error('Cloudinary upload failed.');

    return { url: upload.secure_url };
  }

  private async handleDecode(
    job: Job<DecodeQrJob>,
  ): Promise<{ decoded: string }> {
    const { filePath } = job.data;
    if (!filePath) throw new Error('Missing "filePath" for QR decoding.');

    try {
      const image = await Jimp.read(filePath);

      const qr = new QrCodeReader();

      const decoded: string = await new Promise<string>((resolve, reject) => {
        qr.callback = (
          err: Error | null,
          value: { result?: string } | undefined,
        ): void => {
          if (err) return reject(new Error(err.message));
          if (!value?.result) return reject(new Error('No QR code detected.'));
          resolve(value.result);
        };
        qr.decode(image.bitmap);
      });

      return { decoded };
    } finally {
      //  Clean up the temp file
      await this.fileCleanupService.deleteFiles([filePath]);
    }
  }
}
