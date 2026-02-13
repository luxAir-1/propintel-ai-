import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { StripeService } from './stripe.service';
import { CreateCheckoutSessionDto } from './dtos/checkout.dto';

// Plan configuration with Stripe price IDs
const STRIPE_PLANS = {
  free: {
    name: 'Free',
    price: 0,
    maxListings: 5,
    maxReports: 2,
    maxAlerts: 1,
    features: ['Basic scoring', 'Basic alerts'],
  },
  investor: {
    name: 'Investor',
    price: 79,
    priceId: process.env.STRIPE_PRICE_INVESTOR || 'price_1IB15sI2vYt1L20k1qKO3w7p',
    maxListings: 100,
    maxReports: 20,
    maxAlerts: 10,
    features: ['AI scoring', 'PDF reports', 'Email alerts', 'Financial analysis'],
  },
  pro: {
    name: 'Pro',
    price: 199,
    priceId: process.env.STRIPE_PRICE_PRO || 'price_1IB15sI2vYt1L20k1qKO3w7q',
    maxListings: 500,
    maxReports: 100,
    maxAlerts: 50,
    features: ['Priority support', 'Custom alerts', 'API access', 'Analytics'],
  },
  group: {
    name: 'Group',
    price: 999,
    priceId: process.env.STRIPE_PRICE_GROUP || 'price_1IB15sI2vYt1L20k1qKO3w7r',
    maxListings: 5000,
    maxReports: 1000,
    maxAlerts: 500,
    features: ['Team collaboration', 'Dedicated support', 'Custom integrations'],
  },
};

@Injectable()
export class SubscriptionsService {
  private logger = new Logger(SubscriptionsService.name);

  constructor(
    private prisma: PrismaService,
    private stripeService: StripeService,
  ) {}

  async getSubscription(userId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    return {
      ...subscription,
      planDetails: STRIPE_PLANS[subscription.plan as keyof typeof STRIPE_PLANS] || STRIPE_PLANS.free,
    };
  }

  /**
   * Create checkout session for subscription upgrade
   */
  async createCheckoutSession(
    userId: string,
    plan: string,
    data: CreateCheckoutSessionDto,
  ) {
    // Validate plan
    const planConfig = STRIPE_PLANS[plan as keyof typeof STRIPE_PLANS];
    if (!planConfig || !('priceId' in planConfig)) {
      throw new BadRequestException(`Invalid plan: ${plan}`);
    }

    // Get user
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get or create Stripe customer
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      customerId = await this.stripeService.getOrCreateCustomer(user.id, user.email, user.name);

      // Update user with Stripe customer ID
      await this.prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customerId },
      });
    }

    // Create checkout session
    const checkoutUrl = await this.stripeService.createCheckoutSession(
      customerId,
      (planConfig as any).priceId,
      data.successUrl,
      data.cancelUrl,
    );

    this.logger.log(`✅ Created checkout session for user ${userId} (plan: ${plan})`);

    return {
      checkoutUrl,
      plan,
      planDetails: planConfig,
    };
  }

  /**
   * Cancel subscription
   */
  async cancel(userId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    if (!subscription.stripeSubscriptionId) {
      throw new BadRequestException('No Stripe subscription found');
    }

    // Cancel in Stripe
    await this.stripeService.cancelSubscription(subscription.stripeSubscriptionId);

    // Update in database
    const updated = await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'canceled',
        canceledAt: new Date(),
        plan: 'free',
      },
    });

    this.logger.log(`✅ Canceled subscription for user ${userId}`);

    return updated;
  }

  /**
   * Get usage limits for a subscription tier
   */
  async getUsageLimits(userId: string) {
    const subscription = await this.getSubscription(userId);
    const planConfig = STRIPE_PLANS[subscription.plan as keyof typeof STRIPE_PLANS];

    return {
      plan: subscription.plan,
      maxListings: planConfig?.maxListings || 5,
      maxReports: planConfig?.maxReports || 2,
      maxAlerts: planConfig?.maxAlerts || 1,
    };
  }

  /**
   * Check if user can perform action (usage limit enforcement)
   */
  async canCreateListing(userId: string): Promise<boolean> {
    const limits = await this.getUsageLimits(userId);

    const count = await this.prisma.listing.count({
      where: { userId },
    });

    return count < limits.maxListings;
  }

  async canGenerateReport(userId: string): Promise<boolean> {
    const limits = await this.getUsageLimits(userId);

    const count = await this.prisma.report.count({
      where: { userId },
    });

    return count < limits.maxReports;
  }

  async canCreateAlert(userId: string): Promise<boolean> {
    const limits = await this.getUsageLimits(userId);

    const count = await this.prisma.alert.count({
      where: { userId },
    });

    return count < limits.maxAlerts;
  }

  /**
   * Get all available plans
   */
  getAvailablePlans() {
    return Object.entries(STRIPE_PLANS).map(([key, value]) => ({
      id: key,
      ...value,
    }));
  }
}
