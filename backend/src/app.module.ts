import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { EmailModule } from './email/email.module';
import { QueueModule } from './queue/queue.module';
import { PdfModule } from './pdf/pdf.module';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT) || 6379,
      },
    }),

    // 👇 THEN register queues that use that connection
    BullModule.registerQueue({
      name: 'jobs',
    }),

    PrismaModule,
    AuthModule,
    EmailModule,
    QueueModule,
    PdfModule,
  ],
})
export class AppModule {}
