import { Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { RedisService } from './redis.service';

@Module({
  providers: [RedisService, QueueService],
  exports: [QueueService],
})
export class QueueModule {}
