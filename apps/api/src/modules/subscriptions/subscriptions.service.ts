import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';

@Injectable()
export class SubscriptionsService {
  constructor(private prisma: PrismaService) {}

  async getSubscription(userId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    return subscription;
  }

  async upgrade(userId: string, plan: string) {
    // TODO: Integrate with Stripe
    const subscription = await this.prisma.subscription.update({
      where: { userId },
      data: { plan },
    });

    return subscription;
  }

  async cancel(userId: string) {
    // TODO: Integrate with Stripe
    const subscription = await this.prisma.subscription.update({
      where: { userId },
      data: { status: 'canceled', canceledAt: new Date() },
    });

    return subscription;
  }
}
