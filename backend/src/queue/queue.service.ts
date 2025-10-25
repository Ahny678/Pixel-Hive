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
      maxRetriesPerRequest: null,
    });

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
  async addJob(queueName: string, data: Record<string, any>) {
    try {
      const queue = this.getQueue(queueName);
      await queue.add(queueName, data);
      console.log(`[QueueService] Added job to "${queueName}"`, data);
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
