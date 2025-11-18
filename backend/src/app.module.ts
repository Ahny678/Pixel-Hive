import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { EmailModule } from './email/email.module';
import { QueueModule } from './queue/queue.module';
import { PdfModule } from './pdf/pdf.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { VideoModule } from './video/video.module';
import { QrModule } from './qr/qr.module';
import { FileCleanupModule } from './file-cleanup/file-cleanup.module';
import { WatermarkModule } from './watermark/watermark.module';

@Module({
  imports: [
    CloudinaryModule,
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD,
      },
    }),

    //  PDF processing queue
    BullModule.registerQueue({
      name: 'jobs',
    }),

    //  Video processing queue
    BullModule.registerQueue({
      name: 'video_jobs',
    }),

    //  QR processing queue
    BullModule.registerQueue({
      name: 'qr-jobs',
    }),

    PrismaModule,
    AuthModule,
    EmailModule,
    QueueModule,
    PdfModule,
    CloudinaryModule,
    VideoModule,
    QrModule,
    FileCleanupModule,
    WatermarkModule,
  ],
})
export class AppModule {}
