import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { createClient } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: any;
  private logger = new Logger(RedisService.name);

  async onModuleInit() {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

    try {
      this.client = createClient({ url: redisUrl });
      this.client.on('error', (err: Error) => this.logger.error('Redis error:', err));
      this.client.on('connect', () => this.logger.log('Redis connected'));

      await this.client.connect();
      this.logger.log('✅ Redis service initialized');
    } catch (error) {
      this.logger.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.disconnect();
      this.logger.log('Redis disconnected');
    }
  }

  getClient() {
    return this.client;
  }

  async ping(): Promise<string> {
    return this.client.ping();
  }
}
