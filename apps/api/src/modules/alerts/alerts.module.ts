import { Module } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { AlertsController } from './alerts.controller';
import { PrismaModule } from '@/common/prisma/prisma.module';
import { QueueModule } from '../queue/queue.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';

@Module({
  imports: [PrismaModule, QueueModule, SubscriptionsModule],
  providers: [AlertsService],
  controllers: [AlertsController],
  exports: [AlertsService],
})
export class AlertsModule {}
