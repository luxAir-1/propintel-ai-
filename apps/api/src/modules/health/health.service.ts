import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { QueueService } from '../queue/queue.service';

@Injectable()
export class HealthService {
  constructor(
    private prisma: PrismaService,
    private queueService: QueueService,
  ) {}

  async check() {
    return {
      status: 'ok',
      timestamp: new Date(),
      version: '1.0.0',
    };
  }

  async readiness() {
    try {
      // Check database connection
      await this.prisma.$queryRaw`SELECT 1`;

      return {
        status: 'ready',
        timestamp: new Date(),
        database: 'connected',
      };
    } catch (error) {
      return {
        status: 'not-ready',
        timestamp: new Date(),
        database: 'disconnected',
        error: error.message,
      };
    }
  }

  async getQueueStatus() {
    try {
      return await this.queueService.getAllQueuesStatus();
    } catch (error) {
      return {
        error: 'Failed to get queue status',
        message: error.message,
      };
    }
  }
}
