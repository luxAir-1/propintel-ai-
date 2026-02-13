import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import Stripe from 'stripe';

/**
 * Handles Stripe webhook events
 * All operations are idempotent to handle duplicate webhook deliveries
 */
@Injectable()
export class WebhookService {
  private logger = new Logger(WebhookService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Handle checkout.session.completed event
   * This occurs when a user completes checkout
   */
  async handleCheckoutSessionCompleted(event: Stripe.Event) {
    const session = event.data.object as Stripe.Checkout.Session;

    this.logger.log(`Processing checkout session: ${session.id}`);

    // Find user by Stripe customer ID
    const user = await this.prisma.user.findFirst({
      where: { stripeCustomerId: session.customer as string },
    });

    if (!user) {
      this.logger.warn(`User not found for customer ${session.customer}`);
      return;
    }

    // Get subscription ID from checkout session
    const subscriptionId = session.subscription as string;
    if (!subscriptionId) {
      this.logger.warn(`No subscription ID in session ${session.id}`);
      return;
    }

    // Update user subscription
    const subscription = await this.prisma.subscription.upsert({
      where: { userId: user.id },
      update: {
        stripeSubscriptionId: subscriptionId,
        status: 'active',
        plan: this.getPlanFromMetadata(session.metadata),
        currentPeriodStart: new Date(session.created * 1000),
        currentPeriodEnd: new Date((session.created + 30 * 24 * 60 * 60) * 1000),
      },
      create: {
        userId: user.id,
        stripeSubscriptionId: subscriptionId,
        status: 'active',
        plan: this.getPlanFromMetadata(session.metadata),
        currentPeriodStart: new Date(session.created * 1000),
        currentPeriodEnd: new Date((session.created + 30 * 24 * 60 * 60) * 1000),
      },
    });

    this.logger.log(`✅ Updated subscription for user ${user.id}: ${subscription.id}`);
  }

  /**
   * Handle invoice.paid event
   * This occurs when an invoice is successfully paid
   */
  async handleInvoicePaid(event: Stripe.Event) {
    const invoice = event.data.object as Stripe.Invoice;

    this.logger.log(`Processing paid invoice: ${invoice.id}`);

    // Find subscription by Stripe subscription ID
    const subscription = await this.prisma.subscription.findUnique({
      where: { stripeSubscriptionId: invoice.subscription as string },
      include: { user: true },
    });

    if (!subscription) {
      this.logger.warn(`Subscription not found for Stripe subscription ${invoice.subscription}`);
      return;
    }

    // Update subscription status
    await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'active',
        currentPeriodStart: new Date((invoice.period_start || 0) * 1000),
        currentPeriodEnd: new Date((invoice.period_end || 0) * 1000),
      },
    });

    this.logger.log(`✅ Marked invoice ${invoice.id} as paid`);
  }

  /**
   * Handle invoice.payment_failed event
   * This occurs when a payment attempt fails
   */
  async handleInvoicePaymentFailed(event: Stripe.Event) {
    const invoice = event.data.object as Stripe.Invoice;

    this.logger.log(`Processing failed invoice: ${invoice.id}`);

    // Find subscription
    const subscription = await this.prisma.subscription.findUnique({
      where: { stripeSubscriptionId: invoice.subscription as string },
      include: { user: true },
    });

    if (!subscription) {
      this.logger.warn(`Subscription not found for Stripe subscription ${invoice.subscription}`);
      return;
    }

    // Update subscription status to past due
    await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: 'past_due' },
    });

    this.logger.warn(`⚠️ Payment failed for subscription ${subscription.id}`);

    // TODO: Send email to user about failed payment
  }

  /**
   * Handle customer.subscription.deleted event
   * This occurs when a subscription is canceled
   */
  async handleSubscriptionDeleted(event: Stripe.Event) {
    const stripeSubscription = event.data.object as Stripe.Subscription;

    this.logger.log(`Processing deleted subscription: ${stripeSubscription.id}`);

    // Find subscription
    const subscription = await this.prisma.subscription.findUnique({
      where: { stripeSubscriptionId: stripeSubscription.id },
      include: { user: true },
    });

    if (!subscription) {
      this.logger.warn(`Subscription not found for Stripe subscription ${stripeSubscription.id}`);
      return;
    }

    // Update subscription status
    await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'canceled',
        canceledAt: new Date(),
        plan: 'free',
      },
    });

    this.logger.log(`✅ Canceled subscription ${subscription.id}`);

    // TODO: Downgrade user limits to free tier
  }

  /**
   * Handle customer.subscription.updated event
   * This occurs when subscription details change
   */
  async handleSubscriptionUpdated(event: Stripe.Event) {
    const stripeSubscription = event.data.object as Stripe.Subscription;

    this.logger.log(`Processing updated subscription: ${stripeSubscription.id}`);

    // Find subscription
    const subscription = await this.prisma.subscription.findUnique({
      where: { stripeSubscriptionId: stripeSubscription.id },
    });

    if (!subscription) {
      this.logger.warn(`Subscription not found for Stripe subscription ${stripeSubscription.id}`);
      return;
    }

    // Map Stripe status to our status
    const status = this.mapStripeStatus(stripeSubscription.status);
    const plan = this.getPlanFromMetadata(stripeSubscription.metadata);

    // Update subscription
    await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status,
        plan,
        currentPeriodStart: new Date((stripeSubscription.current_period_start || 0) * 1000),
        currentPeriodEnd: new Date((stripeSubscription.current_period_end || 0) * 1000),
      },
    });

    this.logger.log(`✅ Updated subscription ${subscription.id} status to ${status}`);
  }

  /**
   * Map Stripe subscription status to our status
   */
  private mapStripeStatus(stripeStatus: string): string {
    const statusMap: Record<string, string> = {
      active: 'active',
      past_due: 'past_due',
      canceled: 'canceled',
      incomplete: 'incomplete',
      incomplete_expired: 'failed',
      trialing: 'active',
      paused: 'paused',
    };

    return statusMap[stripeStatus] || 'unknown';
  }

  /**
   * Extract plan from metadata
   */
  private getPlanFromMetadata(metadata: Record<string, string> | null): string {
    if (!metadata) return 'free';
    return metadata.plan || 'free';
  }
}
