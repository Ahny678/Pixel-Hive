import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { EmailModule } from './email/email.module';
import { QueueModule } from './queue/queue.module';
import { PdfModule } from './pdf/pdf.module';

@Module({
  imports: [PrismaModule, AuthModule, EmailModule, QueueModule, PdfModule],
})
export class AppModule {}
