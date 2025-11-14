import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from 'src/prisma/prisma.service';
import { EmailService } from 'src/email/email.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { FileCleanupService } from 'src/file-cleanup/file-cleanup.service';
import { Injectable } from '@nestjs/common';
import { WatermarkProcessorHelper } from './watermark.helper';

@Processor('watermark_jobs')
@Injectable()
export class WatermarkProcessor extends WorkerHost {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly cloudinary: CloudinaryService,
    private readonly fileCleanupService: FileCleanupService,
    private readonly watermarkHelper: WatermarkProcessorHelper,
  ) {
    super();
  }

  async process(job: Job<{ jobId: string }>): Promise<void> {
    const numericJobId = Number(job.data.jobId);
    console.log(`[WatermarkProcessor] Processing job ${numericJobId}...`);

    const watermarkJob = await this.prisma.watermarkJob.findUnique({
      where: { id: numericJobId },
      include: { user: true },
    });

    if (!watermarkJob?.user) {
      console.warn(
        `[WatermarkProcessor] Job ${numericJobId} missing user or record.`,
      );
      return;
    }

    // Log job details for debugging
    this.logJobDetails(watermarkJob);

    await this.prisma.watermarkJob.update({
      where: { id: numericJobId },
      data: { status: 'processing' },
    });

    try {
      // ✅ 1. Apply the watermark locally using your helper
      const localOutputPath = await this.watermarkHelper.applyWatermark({
        fileUrl: watermarkJob.inputFileUrl,
        fileType: watermarkJob.inputFileType.toLowerCase() as 'image' | 'pdf', // Removed 'video'
        watermarkType: watermarkJob.watermarkType.toLowerCase() as
          | 'text'
          | 'image',
        watermarkText: watermarkJob.textContent ?? undefined,
        watermarkImage: watermarkJob.watermarkImageUrl ?? undefined,
        position: watermarkJob.position ?? 'bottom-right',
        opacity: watermarkJob.opacity ?? 0.7,
        fontSize: watermarkJob.fontSize ?? 24,
      });

      console.log(
        `[WatermarkProcessor] Watermark applied locally: ${localOutputPath}`,
      );

      // ✅ 2. Upload the watermarked file back to Cloudinary
      const resourceType = this.getCloudinaryResourceType(
        watermarkJob.inputFileType,
      );

      console.log(
        `[WatermarkProcessor] Uploading to Cloudinary with resource type: ${resourceType}`,
      );

      const uploadResult = await this.cloudinary.uploadFile(
        localOutputPath,
        'watermark-output',
        resourceType,
      );

      console.log(
        `[WatermarkProcessor] File uploaded successfully: ${uploadResult.secure_url}`,
      );

      // ✅ 3. Clean up local temp file AND input file
      try {
        const inputLocalPath = watermarkJob.inputLocalPath;
        if (inputLocalPath) {
          await this.fileCleanupService.deleteFiles([
            localOutputPath,
            inputLocalPath,
          ]);
        }

        console.log(`[WatermarkProcessor] Cleaned up:`, {
          output: localOutputPath,
          input: inputLocalPath,
        });
      } catch (cleanupErr) {
        console.error('[WatermarkProcessor] Cleanup failed:', cleanupErr);
      }

      // ✅ 4. Update job record
      await this.prisma.watermarkJob.update({
        where: { id: numericJobId },
        data: {
          status: 'completed',
          outputFileUrl: uploadResult.secure_url,
          errorMsg: null, // Clear any previous errors
        },
      });

      // ✅ 5. Email user
      const detailsMessage = `Your watermarked file is ready:
    
Input: ${watermarkJob.inputFileUrl}
Output: ${uploadResult.secure_url}

Watermark type: ${watermarkJob.watermarkType}
Position: ${watermarkJob.position ?? 'default'}
Opacity: ${watermarkJob.opacity ?? 0.7}
Font size: ${watermarkJob.fontSize ?? 24}`;

      await this.emailService.sendJobStatusEmail(
        watermarkJob.user.email,
        'File Watermarking - Completed',
        'success',
        detailsMessage,
      );

      console.log(
        `[WatermarkProcessor] Job ${numericJobId} completed successfully.`,
      );
    } catch (error: any) {
      console.error(
        `[WatermarkProcessor] Job ${numericJobId} failed with details:`,
        {
          error: error.message,
          stack: error.stack,
          jobId: numericJobId,
          fileType: watermarkJob.inputFileType,
          watermarkType: watermarkJob.watermarkType,
          position: watermarkJob.position,
        },
      );

      const message = error?.message ?? 'Unknown processing error';

      // Update job with error
      await this.prisma.watermarkJob.update({
        where: { id: numericJobId },
        data: {
          status: 'failed',
          errorMsg: message.substring(0, 1000), // Truncate if too long
        },
      });

      // Send error email
      const errorDetails = `Error: ${message}

Job Details:
- Job ID: ${numericJobId}
- File Type: ${watermarkJob.inputFileType}
- Watermark Type: ${watermarkJob.watermarkType}
- Position: ${watermarkJob.position}
- Opacity: ${watermarkJob.opacity}
- Font Size: ${watermarkJob.fontSize}

If this error persists, please contact support with the Job ID above.`;

      await this.emailService.sendJobStatusEmail(
        watermarkJob.user.email,
        'File Watermarking - Failed',
        'failed',
        errorDetails,
      );
    }
  }

  private getCloudinaryResourceType(fileType: string): 'image' | 'raw' {
    // Removed 'video' return type
    switch (fileType) {
      case 'IMAGE':
        return 'image';
      case 'PDF':
        return 'raw';
      default:
        console.warn(
          `[WatermarkProcessor] Unknown file type: ${fileType}, defaulting to image`,
        );
        return 'image';
    }
    // Removed VIDEO case
  }

  private logJobDetails(watermarkJob: any) {
    console.log('[WatermarkProcessor] Job Details:', {
      id: watermarkJob.id,
      fileType: watermarkJob.inputFileType,
      watermarkType: watermarkJob.watermarkType,
      position: watermarkJob.position,
      opacity: watermarkJob.opacity,
      fontSize: watermarkJob.fontSize,
      hasText: !!watermarkJob.textContent,
      hasImage: !!watermarkJob.watermarkImageUrl,
      inputFileUrl: watermarkJob.inputFileUrl ? 'Present' : 'Missing',
      watermarkImageUrl: watermarkJob.watermarkImageUrl ? 'Present' : 'Missing',
    });
  }
}
