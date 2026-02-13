import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { PrismaModule } from '@/common/prisma/prisma.module';
import { QueueModule } from '../queue/queue.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';

@Module({
  imports: [PrismaModule, QueueModule, SubscriptionsModule],
  providers: [ReportsService],
  controllers: [ReportsController],
  exports: [ReportsService],
})
export class ReportsModule {}
