import { Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [EmailModule],
  providers: [QueueService],
  exports: [QueueService],
})
export class QueueModule {} // ✅ must export this
