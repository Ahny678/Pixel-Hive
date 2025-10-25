import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from 'src/prisma/prisma.service';
import { EmailService } from 'src/email/email.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Processor('video_jobs')
export class VideoProcessor extends WorkerHost {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly cloudinary: CloudinaryService,
  ) {
    super();
    console.log('[VideoProcessor] Worker initialized!');
  }

  async process(job: Job<{ jobId: string }>): Promise<void> {
    const numericJobId = Number(job.data.jobId);
    console.log(`[VideoProcessor] Processing job ${numericJobId}...`);

    const videoJob = await this.prisma.videoJob.findUnique({
      where: { id: numericJobId },
      include: { user: true },
    });
    if (!videoJob?.user) {
      console.warn(
        `[VideoProcessor] Job ${numericJobId} missing user or record.`,
      );
      return;
    }

    await this.prisma.videoJob.update({
      where: { id: numericJobId },
      data: { status: 'processing' },
    });

    try {
      const { videoUrl, timestamps } = videoJob;
      if (!videoUrl) throw new Error('Missing videoUrl in job record.');

      const videoPublicId = this.extractPublicId(videoUrl);
      const times: number[] =
        Array.isArray(timestamps) && timestamps.length
          ? (timestamps as number[])
          : [1, 3, 5, 10];

      console.log(
        `[VideoProcessor] Generating Cloudinary thumbnails for ${videoPublicId}`,
      );

      const uploadedUrls: string[] = times.map((t) =>
        this.cloudinary.buildThumbnailUrl(videoPublicId, t),
      );

      await this.prisma.videoJob.update({
        where: { id: numericJobId },
        data: { status: 'completed', thumbnails: uploadedUrls },
      });

      const detailsMessage =
        uploadedUrls.length > 0
          ? `Your video thumbnails are ready:\n\n${uploadedUrls
              .map((url) => `• ${url}`)
              .join('\n')}`
          : 'Your video thumbnails are ready, but no URLs were returned.';

      await this.emailService.sendJobStatusEmail(
        videoJob.user.email,
        'Video Thumbnail Generation',
        'success',
        detailsMessage,
      );

      console.log(
        `[VideoProcessor] Job ${numericJobId} completed successfully.`,
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown processing error';
      console.error(
        `[VideoProcessor] Job ${numericJobId} failed:`,
        errorMessage,
      );

      await this.prisma.videoJob.update({
        where: { id: numericJobId },
        data: { status: 'failed', errorMsg: errorMessage },
      });

      await this.emailService.sendJobStatusEmail(
        videoJob.user.email,
        'Video Thumbnail Generation',
        'failed',
        errorMessage,
      );
    }
  }

  private extractPublicId(videoUrl: string): string {
    const match = videoUrl.match(/\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/);
    if (!match) throw new Error(`Invalid Cloudinary URL: ${videoUrl}`);
    return match[1];
  }
}
