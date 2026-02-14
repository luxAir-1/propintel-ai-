import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';

export interface JobData {
  userId: string;
  listingId?: string;
  reportId?: string;
  [key: string]: any;
}

@Injectable()
export class QueueService {
  private logger = new Logger(QueueService.name);
  private scoringQueue: Queue | null = null;
  private reportQueue: Queue | null = null;
  private alertQueue: Queue | null = null;

  constructor() {
    this.initializeQueues();
  }

  private initializeQueues() {
    const connection = { host: 'localhost', port: 6379 };

    // Parse Redis URL if provided
    const redisUrl = process.env.REDIS_URL;
    if (redisUrl) {
      const url = new URL(redisUrl);
      Object.assign(connection, {
        host: url.hostname,
        port: parseInt(url.port) || 6379,
        password: url.password || undefined,
        username: url.username || 'default',
      });
    }

    this.scoringQueue = new Queue('scoring', { connection });
    this.reportQueue = new Queue('reports', { connection });
    this.alertQueue = new Queue('alerts', { connection });

    this.logger.log('✅ BullMQ queues initialized');
  }

  async dispatchScoringJob(listingId: string, userId: string): Promise<string> {
    try {
      if (!this.scoringQueue) throw new Error('Scoring queue not initialized');

      const job = await this.scoringQueue.add('score', { listingId, userId }, {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      });

      this.logger.log(`📤 Dispatched scoring job ${job.id} for listing ${listingId}`);
      return job.id!;
    } catch (error) {
      this.logger.error('Failed to dispatch scoring job:', error);
      throw error;
    }
  }

  async dispatchPDFJob(reportId: string, listingId: string, userId: string): Promise<string> {
    try {
      if (!this.reportQueue) throw new Error('Report queue not initialized');

      const job = await this.reportQueue.add('generate', { reportId, listingId, userId }, {
        attempts: 2,
        backoff: {
          type: 'fixed',
          delay: 5000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      });

      this.logger.log(`📤 Dispatched PDF job ${job.id} for report ${reportId}`);
      return job.id!;
    } catch (error) {
      this.logger.error('Failed to dispatch PDF job:', error);
      throw error;
    }
  }

  async dispatchAlertJob(listingId: string, userId: string): Promise<string> {
    try {
      if (!this.alertQueue) throw new Error('Alert queue not initialized');

      const job = await this.alertQueue.add('check', { listingId, userId }, {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      });

      this.logger.log(`📤 Dispatched alert job ${job.id} for listing ${listingId}`);
      return job.id!;
    } catch (error) {
      this.logger.error('Failed to dispatch alert job:', error);
      throw error;
    }
  }

  async getJobStatus(queueName: string, jobId: string) {
    try {
      let queue: Queue | null = null;

      if (queueName === 'scoring') queue = this.scoringQueue;
      else if (queueName === 'reports') queue = this.reportQueue;
      else if (queueName === 'alerts') queue = this.alertQueue;

      if (!queue) throw new Error(`Unknown queue: ${queueName}`);

      const job = await queue.getJob(jobId);
      if (!job) return null;

      const state = await job.getState();
      const progress = job.progress;

      return {
        id: job.id,
        state,
        progress,
        data: job.data,
        returnValue: job.returnvalue,
        failedReason: job.failedReason,
        attempts: job.attemptsMade,
        maxAttempts: job.opts.attempts,
      };
    } catch (error) {
      this.logger.error(`Failed to get job status for ${queueName}:${jobId}:`, error);
      throw error;
    }
  }

  async getQueueStatus(queueName: string) {
    try {
      let queue: Queue | null = null;

      if (queueName === 'scoring') queue = this.scoringQueue;
      else if (queueName === 'reports') queue = this.reportQueue;
      else if (queueName === 'alerts') queue = this.alertQueue;

      if (!queue) throw new Error(`Unknown queue: ${queueName}`);

      const [waiting, active, completed, failed] = await Promise.all([
        queue.getWaitingCount(),
        queue.getActiveCount(),
        queue.getCompletedCount(),
        queue.getFailedCount(),
      ]);

      return {
        queue: queueName,
        waiting,
        active,
        completed,
        failed,
      };
    } catch (error) {
      this.logger.error(`Failed to get queue status for ${queueName}:`, error);
      throw error;
    }
  }

  async getAllQueuesStatus() {
    try {
      const [scoring, reports, alerts] = await Promise.all([
        this.getQueueStatus('scoring'),
        this.getQueueStatus('reports'),
        this.getQueueStatus('alerts'),
      ]);

      return { scoring, reports, alerts };
    } catch (error) {
      this.logger.error('Failed to get all queue statuses:', error);
      throw error;
    }
  }
}
