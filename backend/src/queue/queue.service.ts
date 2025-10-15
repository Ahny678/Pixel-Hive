import { Injectable } from '@nestjs/common';
import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class QueueService {
  private connection: IORedis;
  private myQueue: Queue;

  constructor(private readonly emailService: EmailService) {
    // ✅ Correct instantiation
    this.connection = new IORedis({
      host: 'localhost',
      port: 6379,
      maxRetriesPerRequest: null, // ✅ Required by BullMQ
    });

    this.myQueue = new Queue('jobs', { connection: this.connection });

    // ✅ Explicitly type the job
    new Worker(
      'jobs',
      async (job: Job<{ email: string }>) => this.processJob(job),
      { connection: this.connection },
    );
  }

  async addJob(name: string, data: any) {
    await this.myQueue.add(name, data);
  }

  private async processJob(job: Job<{ email: string }>) {
    try {
      console.log('Processing job:', job.name);

      await this.emailService.sendJobStatusEmail(
        job.data.email,
        job.name,
        'success',
      );
    } catch (err) {
      await this.emailService.sendJobStatusEmail(
        job.data.email,
        job.name,
        'failed',
        (err as Error).message,
      );
    }
  }
}
