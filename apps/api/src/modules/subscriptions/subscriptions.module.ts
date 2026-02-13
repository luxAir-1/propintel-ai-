import { Module } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { StripeService } from './stripe.service';
import { WebhookService } from './webhook.service';
import { WebhookController } from './webhook.controller';
import { PrismaModule } from '@/common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [SubscriptionsService, StripeService, WebhookService],
  controllers: [SubscriptionsController, WebhookController],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
