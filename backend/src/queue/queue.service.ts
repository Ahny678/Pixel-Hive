import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';

@Injectable()
export class QueueService implements OnModuleInit, OnModuleDestroy {
  private connection: IORedis;
  private readonly queues: Map<string, Queue>;
  private isConnected = false;

  constructor() {
    this.queues = new Map();
  }

  async onModuleInit() {
    await this.initializeConnection();
  }

  private async initializeConnection(): Promise<void> {
    try {
      // Use proper IORedis configuration without the RedisOptions type annotation
      this.connection = new IORedis({
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        maxRetriesPerRequest: null,
        lazyConnect: true,
        enableReadyCheck: false,
      });

      // Add event handlers
      this.connection.on('error', (error) => {
        console.error('Redis connection error:', error);
      });

      this.connection.on('connect', () => {
        console.log('Redis connected successfully');
      });

      this.connection.on('ready', () => {
        console.log('Redis ready to accept commands');
      });

      // Wait for connection to be ready
      await this.connection.connect();
      this.isConnected = true;
      console.log('Redis connection initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Redis connection:', error);
      throw error;
    }
  }

  private async getQueue(queueName: string): Promise<Queue> {
    if (!this.isConnected) {
      throw new Error('Redis connection not established');
    }

    if (!this.queues.has(queueName)) {
      const queue = new Queue(queueName, {
        connection: this.connection,
        defaultJobOptions: {
          removeOnComplete: 100,
          removeOnFail: 100,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
        },
      });

      this.queues.set(queueName, queue);
    }
    return this.queues.get(queueName)!;
  }

  async addJob(queueName: string, data: Record<string, any>) {
    try {
      const queue = await this.getQueue(queueName);
      const job = await queue.add(queueName, data, {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      });
      console.log(`[QueueService] Added job to "${queueName}"`, job.id);
      return job;
    } catch (err) {
      console.error(`[QueueService] Failed to add job to "${queueName}":`, err);
      throw err;
    }
  }

  /**
   * Health check for Redis connection
   */
  async healthCheck(): Promise<boolean> {
    try {
      if (!this.connection || !this.isConnected) {
        return false;
      }
      await this.connection.ping();
      return true;
    } catch (error) {
      console.error('Redis health check failed:', error);
      return false;
    }
  }

  async onModuleDestroy() {
    for (const queue of this.queues.values()) {
      await queue.close();
    }
    if (this.connection) {
      await this.connection.quit();
    }
  }
}
