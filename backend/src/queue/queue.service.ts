import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';

@Injectable()
export class QueueService implements OnModuleDestroy {
  private readonly connection: IORedis;
  private readonly queues: Map<string, Queue>;

  constructor() {
    this.connection = new IORedis({
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      maxRetriesPerRequest: null,
    });
    // this.connection = new IORedis(
    //   process.env.REDIS_URL || 'redis://127.0.0.1:6379',
    // );

    this.queues = new Map();
  }

  /**
   * Get or create a queue by name.
   */
  private getQueue(queueName: string): Queue {
    if (!this.queues.has(queueName)) {
      const queue = new Queue(queueName, { connection: this.connection });
      this.queues.set(queueName, queue);
    }
    return this.queues.get(queueName)!;
  }

  /**
   * Add a job to a specific queue.
   */
  // async addJob(queueName: string, data: Record<string, any>) {
  //   try {
  //     const queue = this.getQueue(queueName);
  //     await queue.add(queueName, data);
  //     console.log(`[QueueService] Added job to "${queueName}"`, data);
  //   } catch (err) {
  //     console.error(`[QueueService] Failed to add job to "${queueName}":`, err);
  //     throw err;
  //   }
  // }
  /**
   * Add a job to a specific queue with retry settings.
   */
  async addJob(queueName: string, data: Record<string, any>) {
    try {
      const queue = this.getQueue(queueName);
      await queue.add(queueName, data, {
        attempts: 3, // Retry up to 3 times
        backoff: {
          type: 'exponential',
          delay: 1000, // Delay in ms (e.g. 1 second)
        },
      });
      console.log(
        `[QueueService] Added job to "${queueName}" with retry settings`,
        data,
      );
    } catch (err) {
      console.error(`[QueueService] Failed to add job to "${queueName}":`, err);
      throw err;
    }
  }

  async onModuleDestroy() {
    for (const queue of this.queues.values()) {
      await queue.close();
    }
    await this.connection.quit();
  }
}
