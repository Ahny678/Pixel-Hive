import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueueService } from 'src/queue/queue.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

import { UploadWatermarkDto, WatermarkType } from './dto/upload-watermark.dto';

@Injectable()
export class WatermarkService {
  constructor(
    private prisma: PrismaService,
    private queueService: QueueService,
    private cloudinaryService: CloudinaryService,
  ) {}

  async uploadWatermark(
    userId: number,
    files: Express.Multer.File[],
    dto: UploadWatermarkDto,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided.');
    }

    // Validate files based on watermark type
    if (dto.watermarkType === WatermarkType.IMAGE && files.length < 2) {
      throw new BadRequestException(
        'Watermark image file is required for IMAGE watermark type.',
      );
    }

    const mainFile = files[0];
    const watermarkFile =
      dto.watermarkType === WatermarkType.IMAGE ? files[1] : null;

    // Upload main file to Cloudinary
    const mainFileResourceType = this.getCloudinaryResourceType(dto.fileType);
    const mainUploadResult = await this.cloudinaryService.uploadFile(
      mainFile.path,
      'watermark-input',
      mainFileResourceType,
    );

    let watermarkImageUrl: string | null = null;

    // Upload watermark image if provided
    if (watermarkFile) {
      const watermarkUploadResult = await this.cloudinaryService.uploadFile(
        watermarkFile.path,
        'watermark-images',
        'image',
      );
      watermarkImageUrl = watermarkUploadResult.secure_url;
    }

    // Create job in DB
    const job = await this.prisma.watermarkJob.create({
      data: {
        userId,
        inputFileUrl: mainUploadResult.secure_url,
        inputFileType: dto.fileType,
        watermarkType: dto.watermarkType,
        textContent: dto.textContent,
        watermarkImageUrl,
        opacity: dto.opacity,
        position: dto.position,
        fontSize: dto.fontSize,
      },
    });

    // Add to queue
    await this.queueService.addJob('watermark_jobs', { jobId: job.id });

    return {
      message: 'Watermarking job queued successfully',
      jobId: job.id,
    };
  }

  async getJobStatus(jobId: number) {
    return this.prisma.watermarkJob.findUnique({ where: { id: jobId } });
  }

  private getCloudinaryResourceType(
    fileType: string,
  ): 'image' | 'video' | 'raw' {
    switch (fileType) {
      case 'IMAGE':
        return 'image';
      case 'VIDEO':
        return 'video';
      case 'PDF':
        return 'raw';
      default:
        return 'image';
    }
  }
}
