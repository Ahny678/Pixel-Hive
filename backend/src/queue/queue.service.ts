import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';

@Injectable()
export class QueueService implements OnModuleDestroy {
  private readonly connection: IORedis;
  private readonly queue: Queue;

  constructor() {
    this.connection = new IORedis({
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379,
      maxRetriesPerRequest: null, // Required for BullMQ with ioredis v5+
    });

    this.queue = new Queue('jobs', {
      connection: this.connection,
    });
  }

  /**
   * Add a new job to the queue.
   * @param name The job name (e.g., 'pdf_generate', 'pdf_merge')
   * @param data Arbitrary payload passed to the processor
   */
  async addJob(name: string, data: Record<string, any>) {
    try {
      await this.queue.add(name, data);
      console.log(`[QueueService] Added job "${name}"`, data);
    } catch (err) {
      console.error('[QueueService] Failed to add job:', err);
      throw err;
    }
  }

  /**
   * Graceful shutdown of Redis connection
   */
  async onModuleDestroy() {
    await this.queue.close();
    await this.connection.quit();
  }
}
